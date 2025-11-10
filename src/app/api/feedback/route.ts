
export async function POST(req: Request) {
  try {
    const data = await req.json().catch(()=> ({}));
    // No-op today; just log. Later: write to Firestore / BigQuery / PubSub.
    console.log("[/api/feedback]", data);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
