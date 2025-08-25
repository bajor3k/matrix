// components/RecentActivity.tsx
type Activity = {
  type: "BUY" | "SELL" | "DIVIDEND" | "WATCH";
  text: string;
  ticker?: string;
  when: string; // "2h ago"
};

const items: Activity[] = [
  { type: "BUY",      text: "Bought 10 shares", ticker: "AAPL",    when: "2h ago" },
  { type: "SELL",     text: "Sold 5 shares",    ticker: "MSFT",    when: "4h ago" },
  { type: "DIVIDEND", text: "Dividend received",ticker: "SPY",     when: "1d ago" },
  { type: "WATCH",    text: "Watched stock",    ticker: "TSLA",    when: "2d ago" },
  { type: "BUY",      text: "Bought 15 shares", ticker: "NVDA",    when: "3d ago" },
  { type: "SELL",     text: "Portfolio rebalance executed",        when: "5d ago" },
];

function Pill({ children, tone }: {children: React.ReactNode; tone:"BUY"|"SELL"|"DIVIDEND"|"WATCH"}) {
  const map = {
    BUY:      "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    SELL:     "text-red-300     border-red-500/30     bg-red-500/10",
    DIVIDEND: "text-sky-300     border-sky-500/30     bg-sky-500/10",
    WATCH:    "text-zinc-300    border-zinc-600/30    bg-zinc-600/10",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

export default function RecentActivity() {
  return (
    <section className="relative rounded-2xl border border-white/12 bg-card text-card-foreground">
      {/* Accent rail (no shadow) */}
      <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-emerald-400/80 via-emerald-400/40 to-transparent rounded-l-2xl" />

      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">{items.length}</span>
        </div>
        <a href="/activity" className="text-xs text-zinc-400 hover:text-zinc-200">View all</a>
      </header>

      <ul className="mt-3 max-h-64 overflow-y-auto px-3 pb-4">
        {items.map((it, i) => (
          <li key={i} className="group">
            <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
              {/* Left cluster */}
              <div className="flex min-w-0 items-center gap-3">
                <Pill tone={it.type}>{it.type}</Pill>
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    {it.text}
                    {it.ticker && (
                      <span className="ml-2 font-mono text-zinc-300/90">({it.ticker})</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Right time */}
              <time className="shrink-0 text-xs text-zinc-400">{it.when}</time>
            </div>
            {i < items.length - 1 && <div className="mx-2 border-t border-white/12" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
