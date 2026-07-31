export function isValidCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const provided = request.headers.get("x-cron-secret");
  return provided === expected;
}
