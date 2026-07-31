import type { NormalizedRedditItem } from "@/lib/reddit/types";

export const CLASSIFY_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    isHireIntent: { type: "boolean" },
    confidenceScore: { type: "number" },
    confidenceLabel: { type: "string", enum: ["reject", "low", "medium", "high"] },
    reasoning: { type: "string" },
    needSummary: { type: "string" },
    nicheTag: {
      type: "string",
      enum: ["healthcare", "coaching_consulting", "real_estate", "other", "unclear"],
    },
    contactInfo: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "string" } },
        discord: { type: "array", items: { type: "string" } },
        dmsOpen: { type: "boolean" },
        otherNotes: { type: "string" },
      },
      required: ["emails", "discord", "dmsOpen", "otherNotes"],
    },
  },
  required: [
    "isHireIntent",
    "confidenceScore",
    "confidenceLabel",
    "needSummary",
    "nicheTag",
    "contactInfo",
  ],
};

export function buildClassifySystemInstruction(): string {
  return `You are an intent classifier for a lead-generation tool used by MotionCut Productions, a short-form video editing and content-strategy agency serving healthcare, coaching/consulting, and real estate clients. You will be shown a single Reddit post or comment. Determine whether the AUTHOR is asking to HIRE someone (a video editor, content strategist, or short-form content help) for their OWN business/content - i.e. genuine inbound demand for services like the ones MotionCut offers.

Reject (isHireIntent=false) if: the author is advertising/promoting their OWN freelance or agency services rather than seeking to hire; the text is a general discussion, question, tutorial, or opinion about editing software/techniques with no expressed intent to hire; the hire request is for an unrelated role (e.g. an in-house full-time videographer job posting from a large company, or a role with no connection to video editing/content strategy/short-form content); or the text is too vague to tell.

Accept (isHireIntent=true) if the author is a business owner or individual expressing genuine need to hire or get help with video editing, short-form content (Reels/TikTok/Shorts), or content strategy for their own brand or business.

Be conservative with confidence - reserve 0.8+ for unambiguous hire intent. Output only the JSON object matching the provided schema, nothing else.`;
}

export function buildClassifyUserContent(item: NormalizedRedditItem): string {
  const lines = [
    `Subreddit: r/${item.subreddit}`,
    `Source type: ${item.sourceType}`,
  ];
  if (item.title) lines.push(`Title: ${item.title}`);
  if (item.extraContext) lines.push(`Parent post title (for context): ${item.extraContext}`);
  lines.push(`Full text:\n${item.fullText}`);
  return lines.join("\n");
}

export function buildDraftSystemInstruction(): string {
  return `You are drafting a genuine, helpful reply on behalf of Ibrahim, who runs MotionCut Productions - a short-form video editing and content-strategy agency focused on healthcare, coaching/consulting, and real estate niches. You are replying to a Reddit post or comment where someone expressed they need help with video editing, short-form content, or content strategy.

Write a reply that: directly references specific details from their post so it clearly isn't a copy-paste template; is genuinely helpful FIRST - a tip, a direct answer to something they mentioned, or a clarifying question - before anything resembling an offer; does NOT read as a sales pitch, does NOT say "check out my services," and does NOT drop a link or portfolio unprompted; only if it fits naturally, mentions in a low-pressure way that Ibrahim does this kind of work and is happy to help further ("happy to share more if useful," "feel free to DM me"); matches a casual, human, Reddit-appropriate tone, not corporate; is 2-5 sentences of plain text with no markdown headers; and if the post signals a specific niche (healthcare, coaching/consulting, real estate), lets that inform the language without being overtly salesy about niche expertise.

Output only the reply text, nothing else.`;
}

export function buildDraftUserContent(item: {
  subreddit: string | null;
  sourceType: string;
  title: string | null;
  fullText: string;
  needSummary: string | null;
  nicheTag: string | null;
}): string {
  const lines = [
    `Subreddit: r/${item.subreddit ?? "unknown"}`,
    `Source type: ${item.sourceType}`,
  ];
  if (item.title) lines.push(`Title: ${item.title}`);
  lines.push(`Full text:\n${item.fullText}`);
  if (item.needSummary) lines.push(`What they need (summary): ${item.needSummary}`);
  if (item.nicheTag) lines.push(`Detected niche: ${item.nicheTag}`);
  return lines.join("\n");
}
