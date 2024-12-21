import { useState } from 'react'
import Layout from '../components/Layout'
import EmailCollection from '../components/EmailCollection'
import HashtagInput from '../components/HashtagInput'
import ResultsDisplay from '../components/ResultsDisplay'
import { useTweets } from '../hooks/useTweets';
import { TweetList } from '../components/TweetList';


// Mock sentiment analysis function
const analyzeSentiment = (hashtag: string) => {
  // This is a placeholder. In a real app, you'd call your backend API here.
  const randomScore = Math.random()
  return {
    sentiment: randomScore > 0.6 ? 'positive' : randomScore > 0.4 ? 'neutral' : 'negative',
    score: randomScore,
    interactions: Math.floor(Math.random() * 1000)
  }
}

export default function Home() {
  const [result, setResult] = useState(null)
  const [hashtag, setHashtag] = useState('');
  const { fetchTweetsForHashtag, tweets, loading, error, hasMore, loadMore } = useTweets();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtag.trim()) {
      // Run both the sentiment analysis and tweet fetch
      const analysisResult = analyzeSentiment(hashtag.trim());
      setResult(analysisResult);
      await fetchTweetsForHashtag(hashtag.trim());
    }
  };

  return (
    <Layout>
      <h1 className="text-4xl font-bold mb-8 text-center">Sentiment Analysis Tool</h1>
      <EmailCollection />
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8">
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              placeholder="Enter hashtag to analyze"
              className="w-full p-2 rounded bg-white/5"
            />
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2 bg-blue-600 rounded"
            >
              {loading ? 'Analyzing...' : 'Analyze Hashtag'}
            </button>
          </form>

          <ResultsDisplay result={result} />

          {error && (
            <div className="p-4 mb-4 bg-red-500/20 text-red-300 rounded">
              {error}
            </div>
          )}

          {tweets && (
            <TweetList
              tweets={tweets.data}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </main>
    </Layout>
  );
}
