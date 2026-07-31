import { prisma } from "@/lib/prisma";

/**
 * Checks a batch of externalIds against already-stored leads for a platform,
 * returning the subset not yet seen. This is a pre-filter to avoid wasted
 * Gemini calls - the DB's @@unique([platform, externalId]) constraint remains
 * the authoritative dedup layer at write time (see createLeadIfNew).
 */
export async function filterUnseenExternalIds(
  platform: string,
  externalIds: string[],
): Promise<Set<string>> {
  if (externalIds.length === 0) return new Set();

  const existing = await prisma.lead.findMany({
    where: { platform, externalId: { in: externalIds } },
    select: { externalId: true },
  });
  const seen = new Set(existing.map((l) => l.externalId));
  return new Set(externalIds.filter((id) => !seen.has(id)));
}
