"use client"
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const processTweetsForStorage = (tweets: any[], searchHashtag: string) => {
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
  
  const storeInSupabase = async (processedTweets: any[]) => {
    // First, log what we're trying to store
    console.log('Storing tweets:', processedTweets);
  
    const { data, error } = await supabase
      .from('tweets')
      .upsert(
        processedTweets,
        { 
          onConflict: 'tweet_id', // Specify the column
          ignoreDuplicates: true  // Changed to true to ignore duplicates
        }
      );
  
    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }
  
    return data;
  };
  
  export default function DebugInterface() {
    const [hashtag, setHashtag] = useState('');
    const [twitterResponse, setTwitterResponse] = useState(null);
    const [supabaseData, setSupabaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const loadFromJson = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Load JSON from API route
        const response = await fetch('/api/load-json');
        
        // Check if response is OK and is JSON
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
  
        // Process and store tweets
        const processedTweets = processTweetsForStorage(savedData.data.tweets, hashtag);
        await storeInSupabase(processedTweets);
  
        // Fetch latest stored data
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
  // Function to load and store JSON file
  /*const loadFromJson = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read the JSON file
      const jsonContent = await window.fs.readFile('Results2.json', { encoding: 'utf8' });
      const savedData = JSON.parse(jsonContent);
      setTwitterResponse(savedData);

      if (!savedData.data?.tweets) {
        throw new Error('Invalid JSON format: missing tweets data');
      }

      // Process and store tweets
      const processedTweets = processTweetsForStorage(savedData.data.tweets, hashtag);
      await storeInSupabase(processedTweets);

      // Fetch latest stored data
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
*/
  // Function to test Twitter API and store in Supabase
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

      // Fetch latest stored data
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/5 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Twitter API Testing Interface</h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="Enter hashtag (without #)"
            className="flex-1 p-2 rounded bg-black/20"
          />
          <button
            onClick={testTwitterAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
          <button
            onClick={loadFromJson}
            disabled={loading}
            className="px-4 py-2 bg-green-600 rounded disabled:opacity-50"
          >
            Load from JSON
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-500/20 text-red-300 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Twitter API Response */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Twitter/JSON Response:</h3>
            <div className="bg-black/20 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs whitespace-pre-wrap">
                {twitterResponse ? JSON.stringify(twitterResponse, null, 2) : 'No data yet'}
              </pre>
            </div>
          </div>

          {/* Supabase Stored Data */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Supabase Stored Data:</h3>
            <div className="bg-black/20 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs whitespace-pre-wrap">
                {supabaseData ? JSON.stringify(supabaseData, null, 2) : 'No data yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      {(twitterResponse || supabaseData) && (
        <div className="bg-white/5 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Data Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded">
              <h4 className="font-bold mb-2">Data Source</h4>
              <p>Tweets Retrieved: {twitterResponse?.data?.tweets?.length || 0}</p>
              <p>Success: {twitterResponse?.success ? 'Yes' : 'No'}</p>
              {twitterResponse?.rateLimits && (
                <div className="mt-2">
                  <p>Rate Limit Remaining: {twitterResponse.rateLimits.remaining}</p>
                  <p>Resets At: {twitterResponse.rateLimits.resetsAt}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-black/20 rounded">
              <h4 className="font-bold mb-2">Supabase Storage</h4>
              <p>Records Stored: {supabaseData?.length || 0}</p>
              <p>Latest Record: {supabaseData?.[0]?.created_at ? 
                new Date(supabaseData[0].created_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}