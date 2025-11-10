// app/dashboard/page.tsx
import StockCard from "@/components/StockCard";

export default function DashboardPage() {
  // TODO: Replace with live API later.
  const stocks = [
    { symbol: "SPX",  price: 5982, changePct:  1.18 },
    { symbol: "DJI",  price: 134.55, changePct:  0.74 },
    { symbol: "QQQ",  price: 218.03, changePct: -0.92 },
    { symbol: "IYM", price: 171.44, changePct:  0.36 },
  ];

  return (
    <main className="min-h-dvh p-6">
      <h1 className="mb-4 text-3xl font-semibold">Welcome Josh</h1>

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stocks.map((s) => (
          <StockCard
            key={s.symbol}
            symbol={s.symbol}
            price={s.price}
            changePct={s.changePct}
          />
        ))}
      </section>
    </main>
  );
}
