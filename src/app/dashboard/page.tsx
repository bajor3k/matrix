// app/dashboard/page.tsx
import StockCard from "@/components/StockCard";

export default function DashboardPage() {
  // TODO: Replace with live API later.
  const stocks = [
    { symbol: "AAPL", price: 227.12, up: true },
    { symbol: "NVDA", price: 134.55, up: true },
    { symbol: "TSLA", price: 218.03, up: false },
    { symbol: "GOOGL", price: 171.44, up: true },
  ];

  return (
    <main className="min-h-dvh p-6">
      <h1 className="mb-4 text-3xl font-semibold">Welcome Josh</h1>

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stocks.map((s) => (
          <StockCard key={s.symbol} symbol={s.symbol} price={s.price} up={s.up} />
        ))}
      </section>
    </main>
  );
}
