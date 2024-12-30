// src/lib/twitter.ts
import { TwitterResponse } from './types';

export async function fetchTweets(hashtag: string, nextToken?: string): Promise<TwitterResponse> {
    const cleanHashtag = hashtag.replace('#', '');
    const query = encodeURIComponent(`#${cleanHashtag}`);
    
    const baseUrl = 'https://api.twitter.com/2/tweets/search/recent';
    const params = new URLSearchParams({
      'query': query,
      'max_results': '1', // Reduced to help with rate limits
      'tweet.fields': 'created_at,public_metrics,author_id',
    });
  
    if (nextToken) {
      params.append('next_token', nextToken);
    }
  
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
  
    // Check for rate limiting
    const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
    const rateLimitReset = response.headers.get('x-rate-limit-reset');
    
    if (response.status === 429) {
      const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
      throw new Error(`Rate limit exceeded. Resets at ${resetTime?.toLocaleString() || 'unknown time'}`);
    }
  
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }
  
    const data = await response.json();
    
    // Log rate limit information
    console.log('Rate limit remaining:', rateLimitRemaining);
    console.log('Rate limit resets at:', rateLimitReset ? 
      new Date(parseInt(rateLimitReset) * 1000).toLocaleString() : 'unknown');
  
    return data;
  }