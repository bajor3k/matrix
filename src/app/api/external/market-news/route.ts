
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = "Q5DHFIY1KIJ76U4I"; 
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');
    const sentiment = searchParams.get('sentiment'); // e.g., 'Bullish', 'Bearish'

    // Fetch more items (50) so we can filter them effectively
    let queryParams = `function=NEWS_SENTIMENT&sort=LATEST&limit=50&apikey=${API_KEY}`;
    
    if (tickers) {
        queryParams += `&tickers=${tickers}`;
    }

    const url = `${BASE_URL}?${queryParams}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'request' }
    });
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data["Error Message"]) return NextResponse.json({ error: data["Error Message"] }, { status: 400 });
    if (data["Information"]) return NextResponse.json({ error: data["Information"] }, { status: 429 });

    let feed = data.feed || [];

    // Filter by Sentiment if requested
    if (sentiment && sentiment !== 'All') {
        feed = feed.filter((item: any) => {
            const label = item.overall_sentiment_label;
            if (sentiment === 'Bullish') return label === 'Bullish' || label === 'Somewhat-Bullish';
            if (sentiment === 'Bearish') return label === 'Bearish' || label === 'Somewhat-Bearish';
            if (sentiment === 'Neutral') return label === 'Neutral';
            return true;
        });
    }

    // Return top 10 after filtering
    return NextResponse.json(feed.slice(0, 10));
  } catch (error) {
    console.error('Error fetching News Sentiment:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
