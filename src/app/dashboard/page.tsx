// src/app/dashboard/page.tsx
"use client";

import { useMemo } from "react";
import { Newspaper } from "lucide-react";
import StockCard from "@/components/StockCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

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
function CustomCard({
  title, icon, children, className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground ${className}`}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
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
    { symbol: "SPY",  price: 687.54, changePct:  -1.18 },
    { symbol: "DJI",  price: 134.55, changePct:  0.74 },
    { symbol: "QQQ",  price: 218.03, changePct: -0.92 },
    { symbol: "IYM", price: 171.44, changePct:  0.36 },
  ];

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between w-full">
        <h1 className="text-2xl font-semibold text-foreground">Welcome Josh</h1>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 flex items-center gap-6 text-sm">
            {/* Market Status Section */}
            <div className="flex items-center gap-2">
              {/* Market Open Pill - Border Removed */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-muted-foreground">Market Open</span>
              </div>
              
              {/* 24-Hour Time Display */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">14:35 EST</span>
              </div>
            </div>

            {/* Holiday Section - Border Removed */}
            <div className="hidden md:flex items-center gap-2 pl-6 border-l">
              <Badge variant="outline" className="gap-1.5 font-normal py-1 border-none">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Next Holiday:</span>
                <span>New Year's Day</span>
                <span className="text-muted-foreground mx-1">•</span>
                <span>Jan 1</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>


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
        <CustomCard
          title="News"
          className="min-h-[360px]"
        >
          <ul className="space-y-3">
            {NEWS_DUMMY.map((n, i) => (
              <li
                key={i}
                className="group rounded-lg border border-border bg-background/50 p-3 hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-foreground leading-5">{n.title}</div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">{n.source}</div>
              </li>
            ))}
          </ul>
        </CustomCard>

        {/* Economic Calendar (FED) */}
        <CustomCard
          title="Economic Calendar"
          className="min-h-[360px]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium pb-2 pr-3">Date</th>
                  <th className="text-left font-medium pb-2 pr-3">Time (ET)</th>
                  <th className="text-left font-medium pb-2">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fedRows.map((e, i) => (
                  <tr key={i} className="hover:bg-accent">
                    <td className="py-2 pr-3 text-foreground">{e.date}</td>
                    <td className="py-2 pr-3 text-foreground/80">{e.timeET || "—"}</td>
                    <td className="py-2">
                      <div className="text-foreground">{e.event}</div>
                      {e.note && <div className="text-[12px] text-muted-foreground">{e.note}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CustomCard>

        {/* Earnings — full width */}
        <CustomCard
          title="Earnings Calendar"
        
          className="lg:col-span-2 min-h-[260px]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium pb-2 pr-3">Date</th>
                  <th className="text-left font-medium pb-2 pr-3">Ticker</th>
                  <th className="text-left font-medium pb-2 pr-3">Company</th>
                  <th className="text-left font-medium pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EARNINGS_DUMMY.map((r, i) => (
                  <tr key={i} className="hover:bg-accent">
                    <td className="py-2 pr-3 text-foreground">{r.date}</td>
                    <td className="py-2 pr-3 text-foreground">{r.ticker}</td>
                    <td className="py-2 pr-3 text-foreground/80">{r.company}</td>
                    <td className="py-2">
                      <span
                        className={[
                          "inline-flex items-center rounded px-2 py-0.5 text-[11px]",
                          r.time === "BMO" ? "bg-emerald-500/10 text-emerald-300" :
                          r.time === "AMC" ? "bg-blue-500/10 text-blue-300" :
                          "bg-muted text-muted-foreground",
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
        </CustomCard>
      </div>
    </main>
  );
}
