import { useState } from 'react';
import { TwitterResponse } from '@/lib/twitter';

export function useTweets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweets, setTweets] = useState<TwitterResponse | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();

  const fetchTweetsForHashtag = async (hashtag: string, useNextToken?: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hashtag, 
          nextToken: useNextToken ? nextToken : undefined 
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      if (useNextToken && tweets) {
        // Append new tweets to existing ones
        setTweets({
          data: [...tweets.data, ...data.data.data],
          meta: data.data.meta
        });
      } else {
        setTweets(data.data);
      }

      setNextToken(data.data.meta.next_token);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTweetsForHashtag,
    loading,
    error,
    tweets,
    hasMore: !!nextToken,
    loadMore: () => fetchTweetsForHashtag(tweets?.data[0]?.text.split('#')[1] || '', true)
  };
}