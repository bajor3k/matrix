type Props = {
  symbol: string;
  price: number;
  changePct: number; // e.g., +1.23 or -0.85
};

export default function StockCard({ symbol, price, changePct }: Props) {
  const isUp = changePct >= 0;

  const trendClass = [
    isUp ? "text-emerald-600" : "text-rose-600",            // light mode
    isUp ? "dark:text-emerald-400" : "dark:text-rose-400",  // dark mode
  ].join(" ");

  const pctText = `${isUp ? "+" : ""}${changePct.toFixed(2)}%`;

  return (
    <div
      className="
        rounded-2xl border shadow-sm transition-colors
        bg-white/95 text-gray-900 border-black/10 hover:bg-white
        dark:bg-[#0c0c0c] dark:text-neutral-200 dark:border-white/10 dark:hover:bg-[#121212]
        p-4
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-white/70">
            {symbol}
          </span>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </div>
          <div className={`mt-1 text-xs font-medium ${trendClass}`}>{pctText}</div>
        </div>
      </div>
    </div>
  );
}
