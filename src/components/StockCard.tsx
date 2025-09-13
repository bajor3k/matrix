// components/StockCard.tsx
type Props = {
  symbol: string;
  price: number;
  changePct: number; // e.g., +1.23 or -0.85
};

export default function StockCard({ symbol, price, changePct }: Props) {
  const isUp = changePct >= 0;
  const trendClass = isUp ? "text-emerald-400" : "text-rose-400";
  const trendIcon = isUp ? "▲" : "▼";
  const pctText = `${isUp ? "+" : ""}${changePct.toFixed(2)}%`;

  return (
    <div
      className="rounded-2xl border border-white/10 p-4 shadow-sm transition-colors hover:bg-[#121212]"
      style={{ backgroundColor: "#0c0c0c" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest text-white/70">
            {symbol}
          </span>
        </div>

        {/* Right side price + percent under it */}
        <div className="text-right">
          <div className="text-lg font-semibold">${price.toFixed(2)}</div>
          <div className={`mt-1 text-xs font-medium ${trendClass}`}>{pctText}</div>
        </div>
      </div>
    </div>
  );
}
