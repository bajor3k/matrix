// app/reports/test/page.tsx
import { revalidateTestTag } from "./refresh-action";

export const dynamic = "force-dynamic"; // bypass any static caching
export const revalidate = 0;            // ensure no ISR artifacts during migration

async function getData() {
  const res = await fetch("/api/test", {
    cache: "no-store",
    next: { tags: ["reports-test"] },
  });
  if (!res.ok) throw new Error("Failed to load test data");
  return res.json();
}

export default async function TestReportPage() {
  const data = await getData();

  return (
    <main className="p-6 text-sm text-neutral-200">
      <h1 className="text-xl font-semibold mb-2">Test Report</h1>
      <p className="opacity-80 mb-4">Route is live. Data + cache are wired.</p>

      <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-70">Status</div>
            <div className="font-medium">OK</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">Last updated</div>
            <div className="font-mono">{data.timestamp}</div>
          </div>
        </div>

        <form action={revalidateTestTag} className="mt-4">
          <button
            type="submit"
            className="rounded-xl border border-white/10 px-3 py-1.5 hover:border-white/20"
          >
            Refresh
          </button>
        </form>
      </div>
    </main>
  );
}
