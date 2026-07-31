import type {
  RedditCommentData,
  RedditListingResponse,
  RedditPostData,
  RedditTokenResponse,
} from "./types";

function requireRedditEnv() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;
  if (!clientId || !clientSecret || !userAgent) {
    throw new Error(
      "Missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET / REDDIT_USER_AGENT env vars",
    );
  }
  return { clientId, clientSecret, userAgent };
}

export async function getRedditAccessToken(): Promise<{ token: string; userAgent: string }> {
  const { clientId, clientSecret, userAgent } = requireRedditEnv();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit token request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as RedditTokenResponse;
  return { token: data.access_token, userAgent };
}

interface RateLimitInfo {
  remaining: number | null;
  resetSeconds: number | null;
}

function readRateLimit(res: Response): RateLimitInfo {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  return {
    remaining: remaining ? Number(remaining) : null,
    resetSeconds: reset ? Number(reset) : null,
  };
}

export async function fetchSubredditNewPosts(
  auth: { token: string; userAgent: string },
  subreddit: string,
  opts: { limit?: number; before?: string | null } = {},
): Promise<{ posts: RedditPostData[]; rateLimit: RateLimitInfo }> {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.before) params.set("before", opts.before);

  const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/new?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "User-Agent": auth.userAgent,
    },
  });

  if (!res.ok) {
    throw new Error(`Reddit /new fetch failed for r/${subreddit}: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as RedditListingResponse<RedditPostData>;
  return { posts: data.data.children, rateLimit: readRateLimit(res) };
}

export async function fetchSubredditRecentComments(
  auth: { token: string; userAgent: string },
  subreddit: string,
  opts: { limit?: number; before?: string | null } = {},
): Promise<{ comments: RedditCommentData[]; rateLimit: RateLimitInfo }> {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 100) });
  if (opts.before) params.set("before", opts.before);

  const res = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/comments?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "User-Agent": auth.userAgent,
      },
    },
  );

  if (!res.ok) {
    throw new Error(
      `Reddit /comments fetch failed for r/${subreddit}: ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as RedditListingResponse<RedditCommentData>;
  return { comments: data.data.children, rateLimit: readRateLimit(res) };
}
