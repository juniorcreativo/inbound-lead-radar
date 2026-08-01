const REDDIT_PERMALINK_RE =
  /reddit\.com\/r\/([A-Za-z0-9_]+)\/comments\/([a-z0-9]+)(?:\/[^/]+\/([a-z0-9]+))?/i;

export interface ParsedLeadUrl {
  externalId: string;
  sourceType: "post" | "comment";
  subreddit: string | null;
}

/**
 * Derives a stable dedup key from a Reddit permalink so manually-added leads
 * use the same externalId scheme (t3_/t1_ fullnames) as the automated poller,
 * preventing double-counting if Reddit API access is approved later.
 * Falls back to a hash of the URL for anything that isn't a Reddit permalink.
 */
export function parseLeadUrl(url: string): ParsedLeadUrl {
  const match = url.match(REDDIT_PERMALINK_RE);
  if (match) {
    const [, subreddit, postId, commentId] = match;
    if (commentId) {
      return { externalId: `t1_${commentId}`, sourceType: "comment", subreddit };
    }
    return { externalId: `t3_${postId}`, sourceType: "post", subreddit };
  }

  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return { externalId: `manual_${Math.abs(hash)}`, sourceType: "post", subreddit: null };
}
