import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    // Calculate Date Range (Next 3 Months)
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const fromDate = today.toISOString().split('T')[0];
    const toDate = threeMonthsLater.toISOString().split('T')[0];

    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/ipo?from=${fromDate}&to=${toDate}&token=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) {
      throw new Error(`Finnhub error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data.ipoCalendar || []);
  } catch (error) {
    console.error("IPO Calendar Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch IPOs" }, { status: 500 });
  }
}
