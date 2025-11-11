
// src/app/dashboard/page.tsx
"use client";

import { useMemo } from "react";
import { CalendarDays, Newspaper, Building2 } from "lucide-react";
import StockCard from "@/components/StockCard";

/* ----------------------- Dummy Data ----------------------- */
type NewsItem = { title: string; source: string; time: string };
type FedEvent = { date: string; timeET?: string; event: string; note?: string };
type Earning = { date: string; ticker: string; company: string; time: "BMO" | "AMC" | "TBD" };

const NEWS_DUMMY: NewsItem[] = [
  { title: "SEC updates guidance on custody rule proposals", source: "Bloomberg", time: "12m ago" },
  { title: "Treasuries steady ahead of FOMC minutes", source: "WSJ", time: "38m ago" },
  { title: "Large-cap tech mixed as yields edge higher", source: "Reuters", time: "1h ago" },
];

const FED_DATES_DUMMY: FedEvent[] = [
  { date: "2025-11-20", timeET: "2:00 PM", event: "FOMC Minutes", note: "October meeting minutes release" },
  { date: "2025-12-11", timeET: "2:00 PM", event: "FOMC Rate Decision", note: "Press conference 2:30 PM" },
  { date: "2026-01-08", timeET: "8:30 AM", event: "Fed Chair Remarks", note: "Prepared remarks at policy forum" },
];

const EARNINGS_DUMMY: Earning[] = [
  { date: "2025-11-19", ticker: "NVDA", company: "NVIDIA", time: "AMC" },
  { date: "2025-11-20", ticker: "AAPL", company: "Apple", time: "BMO" },
  { date: "2025-11-20", ticker: "MSFT", company: "Microsoft", time: "AMC" },
  { date: "2025-11-21", ticker: "AMZN", company: "Amazon", time: "TBD" },
];

/* ----------------------- Card Shell ----------------------- */
function Card({
  title, icon, children, className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-[#0c0c0c] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ----------------------- Page ----------------------- */
export default function DashboardPage() {
  const fedRows = useMemo(() => FED_DATES_DUMMY, []);

  // Your original stock data
  const stocks = [
    { symbol: "SPX",  price: 5982, changePct:  1.18 },
    { symbol: "DJI",  price: 134.55, changePct:  0.74 },
    { symbol: "QQQ",  price: 218.03, changePct: -0.92 },
    { symbol: "IYM", price: 171.44, changePct:  0.36 },
  ];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-100">Welcome Josh</h1>

      {/* ----------- YOUR EXISTING KPI ROW - PRESERVED ----------- */}
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

      {/* ---------------- New Cards Grid ---------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* News */}
        <Card
          title="News"
          className="min-h-[360px]"
        >
          <ul className="space-y-3">
            {NEWS_DUMMY.map((n, i) => (
              <li
                key={i}
                className="group rounded-lg border border-white/5 bg-black/20 p-3 hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-gray-200 leading-5">{n.title}</div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{n.time}</span>
                </div>
                <div className="mt-1 text-[12px] text-gray-400">{n.source}</div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Economic Calendar (FED) */}
        <Card
          title="Economic Calendar — FED"
          className="min-h-[360px]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left font-medium pb-2 pr-3">Date</th>
                  <th className="text-left font-medium pb-2 pr-3">Time (ET)</th>
                  <th className="text-left font-medium pb-2">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fedRows.map((e, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-2 pr-3 text-gray-200">{e.date}</td>
                    <td className="py-2 pr-3 text-gray-300">{e.timeET || "—"}</td>
                    <td className="py-2">
                      <div className="text-gray-200">{e.event}</div>
                      {e.note && <div className="text-[12px] text-gray-400">{e.note}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Earnings — full width */}
        <Card
          title="Earnings Calendar"
          icon={<Building2 className="h-4 w-4 text-gray-400" />}
          className="lg:col-span-2 min-h-[260px]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left font-medium pb-2 pr-3">Date</th>
                  <th className="text-left font-medium pb-2 pr-3">Ticker</th>
                  <th className="text-left font-medium pb-2 pr-3">Company</th>
                  <th className="text-left font-medium pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {EARNINGS_DUMMY.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-2 pr-3 text-gray-200">{r.date}</td>
                    <td className="py-2 pr-3 text-gray-200">{r.ticker}</td>
                    <td className="py-2 pr-3 text-gray-300">{r.company}</td>
                    <td className="py-2">
                      <span
                        className={[
                          "inline-flex items-center rounded px-2 py-0.5 text-[11px]",
                          r.time === "BMO" ? "bg-emerald-500/10 text-emerald-300" :
                          r.time === "AMC" ? "bg-blue-500/10 text-blue-300" :
                          "bg-white/10 text-gray-300",
                        ].join(" ")}
                      >
                        {r.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
