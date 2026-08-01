import { z } from "zod";
import { generateContent } from "./client";
import {
  buildClassifySystemInstruction,
  buildClassifyUserContent,
  CLASSIFY_RESPONSE_SCHEMA,
} from "./prompts";
import type { NormalizedRedditItem } from "@/lib/reddit/types";

const ClassifyResultSchema = z.object({
  isHireIntent: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  confidenceLabel: z.enum(["reject", "low", "medium", "high"]),
  needSummary: z.string(),
  nicheTag: z.enum(["healthcare", "coaching_consulting", "real_estate", "other", "unclear"]),
  contactInfo: z.object({
    emails: z.array(z.string()),
    discord: z.array(z.string()),
    dmsOpen: z.boolean(),
    otherNotes: z.string(),
  }),
});

export type ClassifyResult = z.infer<typeof ClassifyResultSchema>;

export async function classifyItem(item: NormalizedRedditItem): Promise<ClassifyResult> {
  const model = process.env.GEMINI_MODEL_CLASSIFY || "gemini-flash-latest";
  const raw = await generateContent({
    model,
    systemInstruction: buildClassifySystemInstruction(),
    userContent: buildClassifyUserContent(item),
    responseSchema: CLASSIFY_RESPONSE_SCHEMA,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Gemini classify response was not valid JSON: ${raw}`);
  }

  return ClassifyResultSchema.parse(parsed);
}
