// src/app/api/tweets/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.error('Twitter Bearer Token is missing');
      return NextResponse.json(
        { success: false, error: 'Twitter API configuration is missing' },
        { status: 500 }
      );
    }

    const { hashtag } = await request.json();

    if (!hashtag) {
      return NextResponse.json(
        { success: false, error: 'Hashtag is required' },
        { status: 400 }
      );
    }

    // Clean hashtag and prepare Twitter API request
    const cleanHashtag = hashtag.replace('#', '').trim();
    const baseUrl = 'https://api.x.com/2/tweets/search/recent';
    
    // V2 API parameters
    const params = new URLSearchParams({
      'query': `#${cleanHashtag}`,
      'max_results': '10',
      'tweet.fields': 'created_at,public_metrics,author_id,entities,context_annotations',
      'expansions': 'author_id,referenced_tweets.id,entities.mentions.username,attachments.media_keys',
      'user.fields': 'name,username,profile_image_url,verified',
      'media.fields': 'url,preview_image_url,type'
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Making Twitter API v2 request:', url);

    const twitterResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const rateLimitRemaining = twitterResponse.headers.get('x-rate-limit-remaining');
    const rateLimitReset = twitterResponse.headers.get('x-rate-limit-reset');

    console.log('Twitter API Response Status:', twitterResponse.status);
    console.log('Rate Limit Remaining:', rateLimitRemaining);
    
    const twitterData = await twitterResponse.json();

    // Log the full response for debugging
    console.log('Twitter API Response:', JSON.stringify(twitterData, null, 2));

    if (!twitterResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Twitter API error',
        details: twitterData,
        requestUrl: url
      }, { status: twitterResponse.status });
    }

    // Process and structure the Twitter data
    const processedTweets = twitterData.data?.map((tweet: any) => {
      const author = twitterData.includes?.users?.find(
        (user: any) => user.id === tweet.author_id
      );

      const media = tweet.attachments?.media_keys?.map((key: string) =>
        twitterData.includes?.media?.find((m: any) => m.media_key === key)
      ).filter(Boolean);

      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        metrics: tweet.public_metrics,
        author: author ? {
          id: author.id,
          username: author.username,
          name: author.name,
          profile_image_url: author.profile_image_url,
          verified: author.verified
        } : null,
        media: media || [],
        hashtags: tweet.entities?.hashtags?.map((h: any) => h.tag) || [],
        mentions: tweet.entities?.mentions?.map((m: any) => m.username) || []
      };
    }) || [];

    // Store processed tweets in Supabase
    try {
      const { data: storedTweets, error: supabaseError } = await supabase
        .from('tweets')
        .insert(
          processedTweets.map((tweet: any) => ({
            tweet_id: tweet.id,
            content: tweet.text,
            created_at: tweet.created_at,
            metrics: tweet.metrics,
            author: tweet.author,
            media: tweet.media,
            hashtags: tweet.hashtags,
            mentions: tweet.mentions,
            search_hashtag: cleanHashtag
          }))
        )
        .select();

      if (supabaseError) {
        console.error('Supabase storage error:', supabaseError);
      }

      return NextResponse.json({
        success: true,
        data: {
          tweets: processedTweets,
          meta: twitterData.meta
        },
        stored: storedTweets || [],
        rateLimits: {
          remaining: rateLimitRemaining,
          resetsAt: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString() : 'unknown'
        }
      });

    } catch (supabaseError) {
      console.error('Supabase operation error:', supabaseError);
      return NextResponse.json({
        success: true,
        data: {
          tweets: processedTweets,
          meta: twitterData.meta
        },
        stored: [],
        storageError: 'Failed to store tweets',
        rateLimits: {
          remaining: rateLimitRemaining,
          resetsAt: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString() : 'unknown'
        }
      });
    }

  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500 }
    );
  }
}