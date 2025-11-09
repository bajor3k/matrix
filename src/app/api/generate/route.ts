import { NextRequest, NextResponse } from "next/server";

const PY_API = process.env.PY_API_URL ?? "http://127.0.0.1:8000/generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { question, mode }
    const r = await fetch(PY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: t || r.statusText }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Proxy error" }, { status: 500 });
  }
}
