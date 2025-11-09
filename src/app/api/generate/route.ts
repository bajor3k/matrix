import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";         // avoid edge runtime
export const runtime = "nodejs";

const PY_API = process.env.PY_API_URL ?? "http://127.0.0.1:8000/generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(PY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await r.text(); // read once
    if (!r.ok) {
      // bubble up exact backend error text
      return NextResponse.json(
        { error: `PY(${r.status}) ${text || r.statusText}` },
        { status: r.status }
      );
    }
    // pass through JSON
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Proxy error" }, { status: 500 });
  }
}
