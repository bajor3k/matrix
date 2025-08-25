
export default function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      {/* Scrollable content */}
      <div className="max-h-64 overflow-y-auto pr-2">
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span>Bought 10 shares of AAPL</span>
            <span className="text-zinc-400">2h ago</span>
          </li>
          <li className="flex justify-between">
            <span>Sold 5 shares of MSFT</span>
            <span className="text-zinc-400">4h ago</span>
          </li>
          <li className="flex justify-between">
            <span>Dividend received from SPY</span>
            <span className="text-zinc-400">1d ago</span>
          </li>
          <li className="flex justify-between">
            <span>Watched stock: TSLA</span>
            <span className="text-zinc-400">2d ago</span>
          </li>
          <li className="flex justify-between">
            <span>Bought 15 shares of NVDA</span>
            <span className="text-zinc-400">3d ago</span>
          </li>
          <li className="flex justify-between">
            <span>Portfolio rebalance executed</span>
            <span className="text-zinc-400">5d ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
