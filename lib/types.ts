export interface ProcessedTweet {
  id: string;
  text: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
    verified?: boolean;
  };
  metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  media: Array<{
    media_key: string;
    type: string;
    url?: string;
    preview_image_url?: string;
  }>;
  hashtags: string[];
  mentions: string[];
}

export interface TwitterResponse {
  success: boolean;
  data: {
    data: ProcessedTweet[];
    meta: {
      next_token?: string;
    };
  };
  rateLimits?: {
    remaining: number;
    resetsAt: string;
  };
} 

