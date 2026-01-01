import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = "Q5DHFIY1KIJ76U4I"; 
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    // Using NEWS_SENTIMENT function
    // limit=10 to keep the dashboard snappy
    const url = `${BASE_URL}?function=NEWS_SENTIMENT&sort=LATEST&limit=10&apikey=${API_KEY}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'request' }
    });
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data["Error Message"]) return NextResponse.json({ error: data["Error Message"] }, { status: 400 });
    if (data["Information"]) return NextResponse.json({ error: data["Information"] }, { status: 429 });

    // The API returns an object with a "feed" array. We return just the feed.
    return NextResponse.json(data.feed || []);
  } catch (error) {
    console.error('Error fetching News Sentiment:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
