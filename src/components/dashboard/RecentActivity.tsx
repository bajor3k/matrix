// components/RecentActivity.tsx
type Activity = {
  text: string;
  ticker?: string;
  when: string; // e.g., "2h ago"
};

const items: Activity[] = [
  { text: "Bought 10 shares",      ticker: "AAPL", when: "2h ago" },
  { text: "Sold 5 shares",         ticker: "MSFT", when: "4h ago" },
  { text: "Dividend received",     ticker: "SPY",  when: "1d ago" },
  { text: "Watched stock",         ticker: "TSLA", when: "2d ago" },
  { text: "Bought 15 shares",      ticker: "NVDA", when: "3d ago" },
  { text: "Portfolio rebalance executed",          when: "5d ago" },
];

export default function RecentActivity() {
  return (
    <section className="rounded-2xl border border-white/12 bg-card text-card-foreground">
      {/* Header (keep count + View all) */}
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
            {items.length}
          </span>
        </div>
        <a href="/activity" className="text-xs text-zinc-400 hover:text-zinc-200">
          View all
        </a>
      </header>

      {/* List (no accent rail, no pills) */}
      <ul className="mt-3 max-h-64 overflow-y-auto px-5 pb-4">
        {items.map((it, i) => (
          <li key={i}>
            <div className="flex items-center justify-between gap-3 rounded-xl py-2">
              <div className="min-w-0">
                <div className="truncate text-sm">
                  <span className="font-medium">{it.text}</span>
                  {it.ticker && (
                    <span className="ml-2 font-mono text-zinc-300/90">({it.ticker})</span>
                  )}
                </div>
              </div>
              <time className="shrink-0 text-xs text-zinc-400">{it.when}</time>
            </div>
            {i < items.length - 1 && <div className="border-t border-white/12" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
