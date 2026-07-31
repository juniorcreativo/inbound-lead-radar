import { prisma } from "@/lib/prisma";

export interface IntentPhraseSet {
  include: string[];
  exclude: string[];
}

export async function loadIntentPhrases(): Promise<IntentPhraseSet> {
  const phrases = await prisma.intentPhrase.findMany({
    where: { enabled: true },
  });
  return {
    include: phrases.filter((p) => p.type === "INCLUDE").map((p) => p.phrase.toLowerCase()),
    exclude: phrases.filter((p) => p.type === "EXCLUDE").map((p) => p.phrase.toLowerCase()),
  };
}

export interface KeywordFilterResult {
  passed: boolean;
  matchedPhrase: string | null;
}

export function applyKeywordFilter(
  text: string,
  phrases: IntentPhraseSet,
): KeywordFilterResult {
  const haystack = text.toLowerCase();

  for (const excludePhrase of phrases.exclude) {
    if (haystack.includes(excludePhrase)) {
      return { passed: false, matchedPhrase: null };
    }
  }

  for (const includePhrase of phrases.include) {
    if (haystack.includes(includePhrase)) {
      return { passed: true, matchedPhrase: includePhrase };
    }
  }

  return { passed: false, matchedPhrase: null };
}
