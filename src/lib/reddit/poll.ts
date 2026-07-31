import { prisma } from "@/lib/prisma";
import { makeSnippet } from "@/lib/format";
import { applyKeywordFilter, loadIntentPhrases } from "@/lib/keywordFilter";
import { filterUnseenExternalIds } from "@/lib/dedup";
import { classifyItem } from "@/lib/gemini/classify";
import {
  fetchSubredditNewPosts,
  fetchSubredditRecentComments,
  getRedditAccessToken,
} from "./client";
import type { NormalizedRedditItem } from "./types";

const REQUEST_PACING_MS = 1100;
const MAX_GEMINI_CALLS_PER_RUN = 15;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PollSummary {
  pollRunId: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  subredditsPolled: number;
  postsFetched: number;
  commentsFetched: number;
  candidatesAfterKeywordFilter: number;
  leadsCreated: number;
  geminiCallsMade: number;
  errors: string[];
}

export async function runRedditPoll(triggeredBy: string): Promise<PollSummary> {
  const pollRun = await prisma.pollRun.create({
    data: { triggeredBy, status: "RUNNING" },
  });

  const errors: string[] = [];
  let postsFetched = 0;
  let commentsFetched = 0;
  let candidatesAfterKeywordFilter = 0;
  let leadsCreated = 0;
  let geminiCallsMade = 0;
  let subredditsPolled = 0;

  try {
    const auth = await getRedditAccessToken();
    const subreddits = await prisma.subredditConfig.findMany({ where: { enabled: true } });
    const phrases = await loadIntentPhrases();

    const allCandidates: {
      item: NormalizedRedditItem;
      matchedPhrase: string | null;
    }[] = [];

    for (const sub of subreddits) {
      subredditsPolled++;
      let newestPostId: string | undefined;
      let newestCommentId: string | undefined;

      if (sub.pollPosts) {
        try {
          const { posts } = await fetchSubredditNewPosts(auth, sub.name, {
            before: sub.lastSeenPostId,
          });
          postsFetched += posts.length;
          if (posts.length > 0) newestPostId = posts[0].data.name;

          for (const post of posts) {
            const item: NormalizedRedditItem = {
              platform: "reddit",
              sourceType: "post",
              externalId: post.data.name,
              subreddit: post.data.subreddit,
              url: `https://reddit.com${post.data.permalink}`,
              author: post.data.author,
              title: post.data.title,
              fullText: post.data.selftext ?? "",
              postedAt: new Date(post.data.created_utc * 1000),
            };
            const text = `${item.title ?? ""}\n${item.fullText}`;
            const result = applyKeywordFilter(text, phrases);
            if (result.passed) {
              candidatesAfterKeywordFilter++;
              allCandidates.push({ item, matchedPhrase: result.matchedPhrase });
            }
          }
        } catch (err) {
          errors.push(`posts:${sub.name}: ${(err as Error).message}`);
        }
        await sleep(REQUEST_PACING_MS);
      }

      if (sub.pollComments) {
        try {
          const { comments } = await fetchSubredditRecentComments(auth, sub.name, {
            before: sub.lastSeenCommentId,
          });
          commentsFetched += comments.length;
          if (comments.length > 0) newestCommentId = comments[0].data.name;

          for (const comment of comments) {
            const item: NormalizedRedditItem = {
              platform: "reddit",
              sourceType: "comment",
              externalId: comment.data.name,
              subreddit: comment.data.subreddit,
              url: `https://reddit.com${comment.data.permalink}`,
              author: comment.data.author,
              title: null,
              fullText: comment.data.body ?? "",
              postedAt: new Date(comment.data.created_utc * 1000),
              extraContext: comment.data.link_title,
            };
            const result = applyKeywordFilter(item.fullText, phrases);
            if (result.passed) {
              candidatesAfterKeywordFilter++;
              allCandidates.push({ item, matchedPhrase: result.matchedPhrase });
            }
          }
        } catch (err) {
          errors.push(`comments:${sub.name}: ${(err as Error).message}`);
        }
        await sleep(REQUEST_PACING_MS);
      }

      await prisma.subredditConfig.update({
        where: { id: sub.id },
        data: {
          ...(newestPostId ? { lastSeenPostId: newestPostId } : {}),
          ...(newestCommentId ? { lastSeenCommentId: newestCommentId } : {}),
        },
      });
    }

    const unseenIds = await filterUnseenExternalIds(
      "reddit",
      allCandidates.map((c) => c.item.externalId),
    );
    const unseenCandidates = allCandidates.filter((c) => unseenIds.has(c.item.externalId));

    for (const candidate of unseenCandidates.slice(0, MAX_GEMINI_CALLS_PER_RUN)) {
      try {
        geminiCallsMade++;
        const classification = await classifyItem(candidate.item);
        if (!classification.isHireIntent) continue;

        await prisma.lead.create({
          data: {
            platform: candidate.item.platform,
            sourceType: candidate.item.sourceType,
            externalId: candidate.item.externalId,
            subreddit: candidate.item.subreddit,
            url: candidate.item.url,
            author: candidate.item.author,
            title: candidate.item.title,
            snippet: makeSnippet(candidate.item.fullText),
            fullText: candidate.item.fullText,
            postedAt: candidate.item.postedAt,
            matchedPhrase: candidate.matchedPhrase,
            confidenceScore: classification.confidenceScore,
            confidenceLabel: classification.confidenceLabel,
            contactInfo: classification.contactInfo,
            needSummary: classification.needSummary,
            nicheTag: classification.nicheTag,
          },
        });
        leadsCreated++;
      } catch (err) {
        // Unique constraint violation (race with another concurrent run) is
        // a safe no-op; anything else gets logged and the run continues.
        const message = (err as Error).message ?? String(err);
        if (!message.includes("Unique constraint")) {
          errors.push(`classify:${candidate.item.externalId}: ${message}`);
        }
      }
    }

    const status = errors.length === 0 ? "SUCCESS" : "PARTIAL";
    await prisma.pollRun.update({
      where: { id: pollRun.id },
      data: {
        finishedAt: new Date(),
        status,
        subredditsPolled,
        postsFetched,
        commentsFetched,
        candidatesAfterKeywordFilter,
        leadsCreated,
        geminiCallsMade,
        errorsJson: errors.length > 0 ? errors : undefined,
      },
    });

    return {
      pollRunId: pollRun.id,
      status,
      subredditsPolled,
      postsFetched,
      commentsFetched,
      candidatesAfterKeywordFilter,
      leadsCreated,
      geminiCallsMade,
      errors,
    };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    await prisma.pollRun.update({
      where: { id: pollRun.id },
      data: {
        finishedAt: new Date(),
        status: "FAILED",
        subredditsPolled,
        postsFetched,
        commentsFetched,
        candidatesAfterKeywordFilter,
        leadsCreated,
        geminiCallsMade,
        errorsJson: [...errors, message],
      },
    });

    return {
      pollRunId: pollRun.id,
      status: "FAILED",
      subredditsPolled,
      postsFetched,
      commentsFetched,
      candidatesAfterKeywordFilter,
      leadsCreated,
      geminiCallsMade,
      errors: [...errors, message],
    };
  }
}
