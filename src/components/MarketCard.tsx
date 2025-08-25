// components/MarketCard.tsx
type MarketCardProps = {
  label: string;      // e.g., "Apple (AAPL)"
  price?: number;     // latest price
  changePct?: number; // e.g., 0.70 for +0.70%
  isLoading?: boolean;
};

export default function MarketCard({ label, price, changePct, isLoading }: MarketCardProps) {
  const up = (changePct ?? 0) >= 0;

  return (
    <div className="rounded-3xl bg-card text-card-foreground shadow-sm border border-border p-5 w-full">
      <div className="text-sm font-medium opacity-90">{label}</div>

      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-semibold tabular-nums">
          {isLoading || price == null ? "Loading..." : `$${price.toFixed(2)}`}
        </div>
        <div className={`text-sm font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
          {isLoading || changePct == null ? "" : `${up ? "↑" : "↓"} ${Math.abs(changePct).toFixed(2)}%`}
        </div>
      </div>
    </div>
  );
}
