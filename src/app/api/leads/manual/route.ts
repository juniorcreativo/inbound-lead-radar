import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeSnippet } from "@/lib/format";
import { parseLeadUrl } from "@/lib/manualLead";
import { classifyItem } from "@/lib/gemini/classify";

interface ManualLeadBody {
  url?: string;
  subreddit?: string;
  author?: string;
  title?: string;
  fullText?: string;
  postedAt?: string;
}

export async function POST(request: Request) {
  let body: ManualLeadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = body.url?.trim();
  const author = body.author?.trim();
  const fullText = body.fullText?.trim();

  if (!url || !author || !fullText) {
    return NextResponse.json(
      { error: "url, author, and fullText are required" },
      { status: 400 },
    );
  }

  const parsed = parseLeadUrl(url);
  const subreddit = body.subreddit?.trim().replace(/^r\//, "") || parsed.subreddit;
  const platform = "reddit";

  const existing = await prisma.lead.findUnique({
    where: { platform_externalId: { platform, externalId: parsed.externalId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This post/comment has already been logged", leadId: existing.id },
      { status: 409 },
    );
  }

  const postedAt = body.postedAt ? new Date(body.postedAt) : new Date();
  const title = body.title?.trim() || null;

  let classification;
  try {
    classification = await classifyItem({
      platform,
      sourceType: parsed.sourceType,
      externalId: parsed.externalId,
      subreddit: subreddit ?? "unknown",
      url,
      author,
      title,
      fullText,
      postedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to classify lead: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const lead = await prisma.lead.create({
    data: {
      platform,
      sourceType: parsed.sourceType,
      externalId: parsed.externalId,
      subreddit,
      url,
      author,
      title,
      snippet: makeSnippet(fullText),
      fullText,
      postedAt,
      matchedPhrase: "manual",
      confidenceScore: classification.confidenceScore,
      confidenceLabel: classification.confidenceLabel,
      contactInfo: classification.contactInfo,
      needSummary: classification.needSummary,
      nicheTag: classification.nicheTag,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
