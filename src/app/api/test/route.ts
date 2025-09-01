// app/api/test/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Mock payload; proves freshness via changing timestamp
  const payload = {
    ok: true,
    source: "ghost-trading:test",
    timestamp: new Date().toISOString(),
  };

  // Ensure no caching while migrating
  const res = NextResponse.json(payload);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
