
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
    <section className="rounded-2xl bg-[#0c0c0c] text-card-foreground p-4 h-full border-none shadow-none">
      {/* Header (keep count + View all) */}
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
          <span className="rounded-full bg-primary/10 text-primary-foreground text-xs px-2 py-0.5 font-medium">
            {items.length}
          </span>
        </div>
        <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          View all
        </a>
      </header>

      {/* List (no accent rail, no pills) */}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <div className="flex items-center justify-between gap-3 py-1.5">
              <div className="min-w-0">
                <div className="truncate text-sm">
                  <span className="text-foreground">{it.text}</span>
                  {it.ticker && (
                    <span className="ml-2 font-mono text-muted-foreground text-xs">({it.ticker})</span>
                  )}
                </div>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">{it.when}</time>
            </div>
            {i < items.length - 1 && <div className="border-t border-border/50" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
