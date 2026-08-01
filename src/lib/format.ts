export function makeSnippet(text: string, maxLength = 200): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

// Replying to a Reddit thread past this age rarely gets a response from OP.
export const STALE_THRESHOLD_DAYS = 3;

export function daysSince(date: string | Date): number {
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function isStale(postedAt: string | Date): boolean {
  return daysSince(postedAt) > STALE_THRESHOLD_DAYS;
}
