export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface RedditPostData {
  kind: "t3";
  data: {
    name: string; // fullname, e.g. "t3_abc123"
    id: string;
    title: string;
    selftext: string;
    author: string;
    permalink: string;
    created_utc: number;
    subreddit: string;
  };
}

export interface RedditCommentData {
  kind: "t1";
  data: {
    name: string; // fullname, e.g. "t1_xyz789"
    id: string;
    body: string;
    author: string;
    permalink: string;
    created_utc: number;
    subreddit: string;
    link_title?: string;
  };
}

export interface RedditListingResponse<T> {
  kind: "Listing";
  data: {
    children: T[];
    after: string | null;
    before: string | null;
  };
}

export interface NormalizedRedditItem {
  platform: "reddit";
  sourceType: "post" | "comment";
  externalId: string;
  subreddit: string;
  url: string;
  author: string;
  title: string | null;
  fullText: string;
  postedAt: Date;
  extraContext?: string; // e.g. parent post title, for comments
}
