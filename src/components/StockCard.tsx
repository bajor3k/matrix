// components/StockCard.tsx
type Props = {
  symbol: string;
  price: number;
  up: boolean; // true = up, false = down
};

export default function StockCard({ symbol, price, up }: Props) {
  const trendClass = up ? "text-emerald-400" : "text-rose-400";
  const trendIcon = up ? "▲" : "▼";

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm
                 hover:bg-white/[0.08] transition-colors"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm uppercase tracking-widest text-white/70">
          {symbol}
        </span>
        <span className="text-lg font-semibold">${price.toFixed(2)}</span>
      </div>
      <div className={`mt-2 text-xs font-medium ${trendClass}`}>
        {trendIcon} {up ? "Up" : "Down"}
      </div>
    </div>
  );
}
