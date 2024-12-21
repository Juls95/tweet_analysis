// src/app/api/load-json/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read from the data directory in your project root
    const filePath = path.join(process.cwd(), 'data', 'saved_tweets.json');
    const jsonContent = readFileSync(filePath, 'utf8');
    
    // Log the content for debugging
    console.log('Read JSON content:', jsonContent.substring(0, 100) + '...');

    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading JSON:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read JSON file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}