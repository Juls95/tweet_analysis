import { Tweet } from '@/lib/twitter';

interface TweetListProps {
  tweets: Tweet[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TweetList({ tweets, loading, hasMore, onLoadMore }: TweetListProps) {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-white/90">{tweet.text}</p>
          {tweet.public_metrics && (
            <div className="mt-2 flex gap-4 text-sm text-white/60">
              <span>♺ {tweet.public_metrics.retweet_count}</span>
              <span>💬 {tweet.public_metrics.reply_count}</span>
              <span>❤️ {tweet.public_metrics.like_count}</span>
            </div>
          )}
          <div className="mt-1 text-xs text-white/40">
            {new Date(tweet.created_at).toLocaleString()}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}