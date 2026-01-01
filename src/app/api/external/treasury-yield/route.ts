import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY; 
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maturity = searchParams.get('maturity') || '10year'; // Default to 10-year
    const interval = searchParams.get('interval') || 'monthly';

    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const url = `${BASE_URL}?function=TREASURY_YIELD&interval=${interval}&maturity=${maturity}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API error messages in the JSON body
    if (data["Error Message"]) {
         return NextResponse.json({ error: data["Error Message"] }, { status: 400 });
    }
    if (data["Information"]) { // Rate limit or other info
         return NextResponse.json({ error: data["Information"] }, { status: 429 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Treasury Yield:', error);
    return NextResponse.json({ error: 'Failed to fetch treasury data' }, { status: 500 });
  }
}