import { generateContent } from "./client";
import { buildDraftSystemInstruction, buildDraftUserContent } from "./prompts";

export async function generateDraftReply(lead: {
  subreddit: string | null;
  sourceType: string;
  title: string | null;
  fullText: string;
  needSummary: string | null;
  nicheTag: string | null;
}): Promise<string> {
  const model = process.env.GEMINI_MODEL_DRAFT || "gemini-flash-latest";
  const raw = await generateContent({
    model,
    systemInstruction: buildDraftSystemInstruction(),
    userContent: buildDraftUserContent(lead),
  });
  return raw.trim();
}
