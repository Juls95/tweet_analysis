import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { fetchTweets } from '@/lib/twitter';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { hashtag, nextToken } = await request.json();
    if (!hashtag) {
      return NextResponse.json(
        { success: false, error: 'Hashtag is required' },
        { status: 400 }
      );
    }

    try {
      const tweets = await fetchTweets(hashtag, nextToken);
      const cacheDir = path.join(process.cwd(), 'cache');
      await writeFile(
        path.join(cacheDir, `tweets_${hashtag}.json`),
        JSON.stringify({ data: tweets, timestamp: new Date().toISOString() })
      );
      return NextResponse.json({ success: true, data: tweets });
    } catch (error) {
      // Check cache
      try {
        const cachedData = await readFile(path.join(process.cwd(), 'cache', `tweets_${hashtag}.json`), 'utf8');
        return NextResponse.json({
          success: true,
          data: JSON.parse(cachedData).data,
          cached: true,
          error: error instanceof Error ? error.message : 'Rate limit exceeded'
        });
      } catch {
        throw error;
      }
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch tweets' },
      { status: error instanceof Error && error.message.includes('Rate limit') ? 429 : 500 }
    );
  }
}