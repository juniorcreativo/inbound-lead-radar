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
      enum: [
        "beauty_skincare",
        "health_supplements",
        "fashion_apparel",
        "home_lifestyle",
        "tech_gadgets",
        "food_beverage",
        "other",
        "unclear",
      ],
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
  return `You are an intent classifier for a lead-generation tool used by MotionCut Productions, an agency that creates AI-powered UGC (user-generated-content-style) video ads and short-form content for e-commerce/DTC brand owners. You will be shown a single Reddit post or comment. Determine whether the AUTHOR is an e-commerce store or brand owner asking to HIRE someone for UGC content, UGC-style video ads, AI UGC/AI avatar content, or short-form ad creative for their products - i.e. genuine inbound demand for services like the ones MotionCut offers.

Reject (isHireIntent=false) if: the author is a UGC creator, video editor, or agency advertising/promoting their OWN services rather than seeking to hire; the text is a general discussion, question, tutorial, or opinion about ecommerce, marketing, or editing software with no expressed intent to hire; the hire request is for video/content work unrelated to e-commerce products (e.g. a documentary, streamer, author, or in-house corporate videographer role with no product/store to advertise); or the text is too vague to tell.

Accept (isHireIntent=true) if the author owns or runs an e-commerce store, DTC brand, or physical/digital product business and expresses genuine need to hire or get help with UGC content, UGC-style video ads, AI UGC/AI avatar content, or short-form ad creative (Reels/TikTok/Shorts ads) to market their products.

Be conservative with confidence - reserve 0.8+ for unambiguous hire intent from a real product/store owner. Output only the JSON object matching the provided schema, nothing else.`;
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
  return `You are drafting a genuine, helpful reply on behalf of Ibrahim, who runs MotionCut Productions - an agency specializing in AI-powered UGC video ads and short-form content for e-commerce/DTC brands, with a track record of high-performing UGC campaigns for a number of brands. You are replying to a Reddit post or comment where an e-commerce/product business owner expressed they need help with UGC content, UGC-style ads, AI UGC/avatar content, or short-form ad creative.

Write a reply that: directly references specific details from their post (their product, store, or stated goal) so it clearly isn't a copy-paste template; is genuinely helpful FIRST - a tip about what makes UGC ads convert, a direct answer to something they mentioned, or a clarifying question - before anything resembling an offer; does NOT read as a sales pitch, does NOT say "check out my services," and does NOT drop a link or portfolio unprompted; only if it fits naturally, mentions in a low-pressure way that Ibrahim's agency does AI UGC content for ecommerce brands and has had strong results; matches a casual, human, Reddit-appropriate tone, not corporate; and is 2-5 sentences of plain text with no markdown headers.

CRITICAL - do not solicit contact: never include phrases like "DM me," "PM me," "message me," "feel free to reach out," "shoot me a message," or any other direct call-to-action to contact you. Many subreddits (especially business/marketplace-adjacent ones like r/dropship, r/forhire, r/Entrepreneur) run AutoMod rules that auto-remove any comment containing solicitation phrases like these, regardless of context or how genuine the rest of the comment is - the comment gets deleted even if it was helpful. If you mention MotionCut/Ibrahim's work at all, state it as a plain fact ("I run an agency that does exactly this for ecom brands") and stop there - let the reader check the profile or reply on their own if interested. Do not tell them how to contact you.

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
  if (item.nicheTag) lines.push(`Detected product category: ${item.nicheTag}`);
  return lines.join("\n");
}
