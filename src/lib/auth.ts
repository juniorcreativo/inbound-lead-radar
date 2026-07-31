// Uses Web Crypto (crypto.subtle) rather than node:crypto so this works
// identically whether middleware runs on the Edge or Node.js runtime.

const encoder = new TextEncoder();

const SESSION_COOKIE_NAME = "ilr_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const SESSION_COOKIE = {
  name: SESSION_COOKIE_NAME,
  maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
};

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hmacSha256Hex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(digest);
}

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

export async function createSessionToken(): Promise<string> {
  const secret = requireSessionSecret();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `authenticated:${expiresAt}`;
  const signature = await hmacSha256Hex(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  const secret = requireSessionSecret();
  const expectedSignature = await hmacSha256Hex(payload, secret);
  if (!constantTimeEqual(fromHex(signature), fromHex(expectedSignature))) {
    return false;
  }

  const [marker, expiresAtRaw] = payload.split(":");
  if (marker !== "authenticated") return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export async function verifyPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const submittedHash = await sha256Hex(submitted);
  const expectedHash = await sha256Hex(expected);
  return constantTimeEqual(fromHex(submittedHash), fromHex(expectedHash));
}
