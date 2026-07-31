export function makeSnippet(text: string, maxLength = 200): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
