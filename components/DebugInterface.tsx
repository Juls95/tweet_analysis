"use client"
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Logo from './Logo';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ProcessedTweet } from '@/lib/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SentimentDistribution {
    positive: number;
    negative: number;
    neutral: number;
  }
  
  interface BotStatistics {
    bot_count: number;
    human_count: number;
    bot_percentage: number;
  }
  
  interface AnalysisResults {
    total_tweets: number;
    sentiment_distribution: SentimentDistribution;
    average_sentiment: number;
    bot_statistics: BotStatistics;
    most_common_words: [string, number][];
    processed_tweets: ProcessedTweet[];
  }
  
  interface AnalysisResponse {
    success: boolean;
    data: AnalysisResults;
  }
  
  interface StoredTweet {
    tweet_id: string;
    content: string;
    created_at: string;
    search_hashtag: string;
    author_id?: string;
    author_info: ProcessedTweet['author'] | null;
    metrics: ProcessedTweet['metrics'] | null;
    media: ProcessedTweet['media'];
    hashtags: string[];
    mentions: string[];
  }
  

const SENTIMENT_COLORS = {
    positive: '#4CAF50',
    neutral: '#FFC107',
    negative: '#F44336'
  };
  
const BOT_COLORS = ['#2196F3', '#FF9800'];

const processTweetsForStorage = (tweets: ProcessedTweet[], searchHashtag: string): StoredTweet[] => {
  return tweets.map(tweet => ({
    tweet_id: tweet.id,
    content: tweet.text,
    created_at: tweet.created_at,
    search_hashtag: searchHashtag,
    author_id: tweet.author?.id,
    author_info: tweet.author || null,
    metrics: tweet.metrics || null,
    media: tweet.media || [],
    hashtags: tweet.hashtags || [],
    mentions: tweet.mentions || []
  }));
};

const storeInSupabase = async (processedTweets: StoredTweet[]) => {
  console.log('Storing tweets:', processedTweets);

  const { data, error } = await supabase
    .from('tweets')
    .upsert(
      processedTweets,
      { 
        onConflict: 'tweet_id',
        ignoreDuplicates: true
      }
    );

  if (error) {
    console.error('Supabase storage error:', error);
    throw error;
  }

  return data;
};

interface TwitterResponse {
  success: boolean;
  data: {
    tweets: ProcessedTweet[];
  };
  rateLimits?: {
    remaining: number;
    resetsAt: string;
  };
}

export default function DebugInterface() {
  const [hashtag, setHashtag] = useState('');
  const [twitterResponse, setTwitterResponse] = useState<TwitterResponse | null>(null);
  const [supabaseData, setSupabaseData] = useState<StoredTweet[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromJson = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/load-json');
      
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid response:', text);
        throw new Error('Received invalid response from server');
      }

      const savedData = await response.json();
      console.log('Loaded data:', savedData);

      if (!savedData.data?.tweets) {
        throw new Error('Invalid JSON format: missing tweets data');
      }

      setTwitterResponse(savedData);

      if (!hashtag) {
        throw new Error('Please enter a hashtag before loading data');
      }

      const processedTweets = processTweetsForStorage(savedData.data.tweets, hashtag);
      await storeInSupabase(processedTweets);

      const { data: latestTweets, error: fetchError } = await supabase
        .from('tweets')
        .select('*')
        .eq('search_hashtag', hashtag)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      setSupabaseData(latestTweets);

    } catch (err) {
      console.error('Error loading JSON:', err);
      setError(err instanceof Error ? err.message : 'An error occurred loading JSON');
    } finally {
      setLoading(false);
    }
  };

  const testTwitterAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hashtag })
      });

      const data = await response.json();
      setTwitterResponse(data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      const processedTweets = processTweetsForStorage(data.data.tweets, hashtag);
      await storeInSupabase(processedTweets);

      const { data: latestTweets, error: fetchError } = await supabase
        .from('tweets')
        .select('*')
        .eq('search_hashtag', hashtag)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      setSupabaseData(latestTweets);

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const analyzeTweets = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      // Call Python analysis service directly
      const response = await fetch(`http://localhost:8000/analyze/${encodeURIComponent(hashtag)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze tweets');
      }

      setAnalysisResults(data);

      // Store analysis results in Supabase
      const { error: storeError } = await supabase
        .from('tweet_analysis')
        .upsert({
          hashtag: hashtag,
          analysis_date: new Date().toISOString(),
          results: data
        }, {
          onConflict: 'hashtag'
        });

      if (storeError) {
        console.error('Error storing analysis:', storeError);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze tweets');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Logo />
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="text-blue-300 hover:text-blue-100">Home</a></li>
              <li><a href="/about" className="text-blue-300 hover:text-blue-100">About</a></li>
              
            </ul>
          </nav>
        </header>

        <main>
          <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-300">Sentiment Analysis Dashboard</h1>
            
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4 text-blue-200">Twitter API Testing Interface</h2>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                    placeholder="Enter hashtag (without #)"
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={testTwitterAPI}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      {loading ? 'Testing...' : 'Test API'}
                    </button>
                    <button
                      onClick={loadFromJson}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
                    >
                      Load from JSON
                    </button>
                    <button
                      onClick={analyzeTweets}
                      disabled={analyzing}
                      className="flex-1 px-4 py-2 bg-purple-600 rounded disabled:opacity-50 hover:bg-purple-700 transition-colors"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze Tweets'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1">
  <Image 
    src={'/thena_logo.jpg'} 
    alt="Sentiment Analysis Illustration" 
    width={400} 
    height={300} 
    className="mx-auto"
  />
</div>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-500/20 text-red-300 rounded">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Twitter API Response */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-blue-200">Twitter/JSON Response:</h3>
                <div className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {twitterResponse ? JSON.stringify(twitterResponse, null, 2) : 'No data yet'}
                  </pre>
                </div>
              </div>

              {/* Supabase Stored Data */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-blue-200">Supabase Stored Data:</h3>
                <div className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {supabaseData ? JSON.stringify(supabaseData, null, 2) : 'No data yet'}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResults?.data && (
            <div className="bg-white/10 p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-300">Sentiment Analysis Results</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2 text-blue-200">Sentiment Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analysisResults.data.sentiment_distribution).map(([key, value]) => ({
                            name: key,
                            value: value as number
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                          label
                        >
                          {Object.entries(analysisResults.data.sentiment_distribution).map(([key], index) => (
                            <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2 text-blue-200">Bot Detection</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Human', value: analysisResults.data.bot_statistics.human_count },
                            { name: 'Bot', value: analysisResults.data.bot_statistics.bot_count }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          fill="#82ca9d"
                          dataKey="value"
                          label
                        >
                          {BOT_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2 text-blue-200">Most Common Words</h4>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {analysisResults.data.most_common_words.map(([word, count]) => (
                      <div key={word} className="flex justify-between">
                        <span className="text-gray-300">{word}</span>
                        <span className="text-gray-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold mb-2 text-blue-200">Raw Analysis Data:</h4>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(analysisResults.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Data Summary */}
          {(twitterResponse || supabaseData) && (
            <div className="bg-white/10 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-300">Data Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2 text-blue-200">Data Source</h4>
                  <p className="text-gray-300">Tweets Retrieved: {twitterResponse?.data?.tweets?.length || 0}</p>
                  <p className="text-gray-300">Success: {twitterResponse?.success ? 'Yes' : 'No'}</p>
                  {twitterResponse?.rateLimits && (
                    <div className="mt-2">
                      <p className="text-gray-300">Rate Limit Remaining: {twitterResponse.rateLimits.remaining}</p>
                      <p className="text-gray-300">Resets At: {twitterResponse.rateLimits.resetsAt}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-bold mb-2 text-blue-200">Supabase Storage</h4>
                  <p className="text-gray-300">Records Stored: {supabaseData?.length || 0}</p>
                  <p className="text-gray-300">Latest Record: {supabaseData?.[0]?.created_at ? 
                    new Date(supabaseData[0].created_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}