
"use client";

import { useMemo, useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import StockCard from "@/components/StockCard";
// Alias the UI Card to avoid conflict with your local Card component below
import { Card as UiCard, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge";

/* ----------------------- Types ----------------------- */
interface MarketStatus {
  isOpen: boolean;
  session: string | null;
  holiday: string | null;
  t: number;
}

interface MarketHoliday {
  eventName: string;
  atDate: string;
  tradingHour: string;
}

interface MarketNews {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  source: string;
  url: string;
  summary: string;
}

interface SecFiling {
  accessNumber: string;
  symbol: string;
  cik: string;
  form: string;
  filedDate: string;
  acceptedDate: string;
  reportUrl: string;
  filingUrl: string;
}

interface IpoEvent {
  date: string;
  symbol: string;
  name: string;
  status: string;
  price: string;
  exchange: string;
}

interface UsaSpendingData {
  symbol: string;
  data: {
    awardingAgencyName: string;
    actionDate: string;
    totalValue: number;
    awardDescription: string;
  }[];
}

type FedEvent = { date: string; timeET?: string; event: string; note?: string };
type Earning = { date: string; ticker: string; company: string; time: "BMO" | "AMC" | "TBD" };

/* ----------------------- Dummy Data (Static) ----------------------- */
const FED_DATES_DUMMY: FedEvent[] = [
  { date: "2025-11-20", timeET: "2:00 PM", event: "FOMC Minutes", note: "October meeting minutes release" },
  { date: "2025-12-11", timeET: "2:00 PM", event: "FOMC Rate Decision", note: "Press conference 2:30 PM" },
  { date: "2026-01-08", timeET: "8:30 AM", event: "Fed Chair Remarks", note: "Prepared remarks at policy forum" },
];

/* ----------------------- Helpers ----------------------- */
function timeAgo(unixTimestamp: number) {
  const seconds = Math.floor((new Date().getTime() - unixTimestamp * 1000) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

// Helper function for MM.DD.YYYY format
const formatSecDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear(); // Uses full 4-digit year
  return `${month}.${day}.${year}`;
};

// Helper to format date as MM.DD.YYYY
const formatSpendingDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Using UTC methods ensures dates like "2025-11-20" don't shift to "19" due to timezones
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}.${day}.${year}`;
};

// Helper to format IPO date as MM.DD.YYYY
const formatIpoDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}.${day}.${year}`;
};


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
  
  // State
  const [marketData, setMarketData] = useState<MarketStatus | null>(null);
  const [nextHoliday, setNextHoliday] = useState<MarketHoliday | null>(null);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [filings, setFilings] = useState<SecFiling[]>([]);
  const [ipos, setIpos] = useState<IpoEvent[]>([]);
  const [usaSpending, setUsaSpending] = useState<UsaSpendingData | null>(null);
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false);


  // Fetch All Data on Mount
  useEffect(() => {
    // 1. Market Status
    fetch("/api/external/market-status")
      .then((res) => res.json())
      .then((data) => !data.error && setMarketData(data))
      .catch((err) => console.error("Status fetch error", err));

    // 2. Market Holidays
    fetch("/api/external/market-holiday")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          const todayStr = new Date().toISOString().split('T')[0];
          const upcoming = json.data
            .filter((h: MarketHoliday) => h.atDate >= todayStr)
            .sort((a: MarketHoliday, b: MarketHoliday) => a.atDate.localeCompare(b.atDate));
          if (upcoming.length > 0) setNextHoliday(upcoming[0]);
        }
      })
      .catch((err) => console.error("Holiday fetch error", err));

    // 3. Market News
    fetch("/api/external/market-news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNews(data.slice(0, 5)); // Keep top 5 stories
        }
      })
      .catch((err) => console.error("News fetch error", err));
    
    // 4. SEC Filings
    fetch("/api/external/sec-filings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFilings(data.slice(0, 7)); // Show top 7 filings
        }
      })
      .catch((err) => console.error("Filings fetch error", err));

    // 5. IPO Calendar
    fetch("/api/external/ipo-calendar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by date (nearest first) and take top 10
          const sorted = data.sort((a: IpoEvent, b: IpoEvent) => a.date.localeCompare(b.date));
          setIpos(sorted.slice(0, 10));
        }
      })
      .catch((err) => console.error("IPO fetch error", err));

    // 6. USA Spending
    fetch("/api/external/usa-spending?symbol=LMT")
      .then((res) => res.json())
      .then((data) => !data.error && setUsaSpending(data))
      .catch((err) => console.error("USA Spending fetch error", err));
  }, []);

  const stocks = [
    { symbol: "SPY",  price: 687.54, changePct:  -1.18 },
    { symbol: "DJI",  price: 134.55, changePct:  0.74 },
    { symbol: "QQQ",  price: 218.03, changePct: -0.92 },
    { symbol: "IYM", price: 171.44, changePct:  0.36 },
  ];
  
  const sortedSpendingData = useMemo(() => {
    if (!usaSpending?.data) return [];
    return [...usaSpending.data].sort((a,b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime());
  }, [usaSpending]);

  const previewSpendingData = useMemo(() => sortedSpendingData.slice(0, 5), [sortedSpendingData]);


  return (
    <main className="p-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Welcome Josh</h1>

        {/* Market Status Component */}
        {marketData && (
          <UiCard className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex items-center gap-6 text-sm">
              {/* Status Section - Time Removed */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    {/* Green Ping (Market Open) */}
                    {marketData.isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    
                    {/* Red Ping (Post-Market) */}
                    {!marketData.isOpen && marketData.session === 'post-market' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    )}

                    {/* Main Dot Color */}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      marketData.isOpen 
                        ? 'bg-emerald-500' 
                        : (marketData.session === 'post-market' ? 'bg-red-500' : 'bg-gray-400')
                    }`}></span>
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {marketData.isOpen 
                      ? "Market Open" 
                      : (marketData.session 
                          ? marketData.session.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) 
                          : "Closed")}
                  </span>
                </div>
              </div>

              {/* Holiday Section - Softer Border */}
              {nextHoliday && (
                <div className="hidden md:flex items-center gap-2 pl-6 border-l border-border/50 dark:border-white/10">
                  <Badge variant="outline" className="gap-1.5 font-normal py-1 border-none">
                    <span className="text-muted-foreground">Next Holiday:</span>
                    <span className="font-medium text-foreground">{nextHoliday.eventName}</span>
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="text-muted-foreground">
                      {new Date(nextHoliday.atDate + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </Badge>
                </div>
              )}
            </CardContent>
          </UiCard>
        )}
      </div>

      {/* KPI ROW */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stocks.map((s) => (
          <StockCard key={s.symbol} symbol={s.symbol} price={s.price} changePct={s.changePct} />
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Market News */}
        <Card title="Market News" className="min-h-[360px]">
          <ul className="space-y-3">
            {news.length === 0 ? (
              <li className="text-muted-foreground text-sm">Loading news...</li>
            ) : (
              news.map((n) => (
                <li
                  key={n.id}
                  className="group rounded-lg border border-border bg-background/50 p-3 hover:border-primary/20 transition-colors"
                >
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm text-foreground leading-5 font-medium group-hover:text-primary transition-colors">
                        {n.headline}
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(n.datetime)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground font-semibold">{n.source}</div>
                    </div>
                  </a>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* SEC Filings */}
        <Card title="SEC Filings" className="min-h-[360px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm sec-filings-table">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left font-medium pb-2 pr-3 pl-2">Symbol</th>
                  <th className="text-left font-medium pb-2 pr-3">Form</th>
                  <th className="text-left font-medium pb-2 pr-3">Filed Date</th>
                  <th className="text-right font-medium pb-2 pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">
                      Loading filings...
                    </td>
                  </tr>
                ) : (
                  filings.map((f, i) => (
                    <tr key={i} className="hover:bg-accent/50 transition-colors">
                      <td className="py-2.5 pl-2 font-semibold text-foreground">{f.symbol}</td>
                      <td className="py-2.5">
                        <Badge variant="secondary" className="font-mono text-xs font-normal">
                          {f.form}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">
                        {formatSecDate(f.filedDate)}
                      </td>
                      <td className="py-2.5 pr-2 text-right action-col">
                        <a 
                          href={f.filingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs view-btn"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

       {/* Bottom Row */}
      <div className="bottom-row">
        {/* IPO Calendar */}
        <div className="rounded-xl border bg-card text-card-foreground ipo-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">IPO Calendar</h3>
            </div>
            <div className="table-container p-4">
                <table className="w-full text-sm">
                <thead>
                    <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left font-medium pb-2 pr-3 pl-2">Date</th>
                    <th className="text-left font-medium pb-2 pr-3">Ticker</th>
                    <th className="text-left font-medium pb-2 pr-3">Company</th>
                    <th className="text-left font-medium pb-2 pr-3">Price Range</th>
                    <th className="text-left font-medium pb-2">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {ipos.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground text-xs">
                        No upcoming IPOs found.
                        </td>
                    </tr>
                    ) : (
                    ipos.map((ipo, i) => (
                        <tr key={i} className="hover:bg-accent/50 transition-colors">
                        <td className="py-2.5 pl-2 text-foreground text-xs">{formatIpoDate(ipo.date)}</td>
                        <td className="py-2.5 font-semibold text-blue-600 dark:text-blue-400 text-xs">{ipo.symbol || "—"}</td>
                        <td className="py-2.5 text-foreground/90 text-xs truncate max-w-[200px]" title={ipo.name}>
                            {ipo.name}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">{ipo.price || "TBD"}</td>
                        <td className="py-2.5">
                            <Badge 
                            variant="outline" 
                            className={`text-[10px] font-normal border-none px-2 py-0.5 ${
                                ipo.status === 'priced' ? 'bg-emerald-500/10 text-emerald-500' :
                                ipo.status === 'expected' ? 'bg-blue-500/10 text-blue-500' :
                                ipo.status === 'withdrawn' ? 'bg-red-500/10 text-red-500' :
                                'bg-muted text-muted-foreground'
                            }`}
                            >
                            {ipo.status}
                            </Badge>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </div>

        {/* USA Spending */}
        <div className="rounded-xl border bg-card text-card-foreground usa-spending-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">USA Spending</h3>
            </div>
            <div className="table-container">
                <table className="w-full text-sm usa-spending-table">
                <thead>
                    <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left font-medium pb-2 pr-3 pl-2">Agency</th>
                    <th className="text-left font-medium pb-2 pr-3">Date</th>
                    <th className="text-right font-medium pb-2 pr-3">Amount</th>
                    <th className="text-left font-medium pb-2">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {!usaSpending || previewSpendingData.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">
                        {usaSpending === null ? 'Loading data...' : 'No recent contracts found.'}
                        </td>
                    </tr>
                    ) : (
                    previewSpendingData.map((item, i) => (
                        <tr key={i} className="hover:bg-accent/50 transition-colors">
                        <td className="py-2.5 pl-2 text-foreground text-xs truncate max-w-[150px]" title={item.awardingAgencyName}>
                            {item.awardingAgencyName}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">{formatSpendingDate(item.actionDate)}</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                            ${item.totalValue.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs truncate max-w-[150px]" title={item.awardDescription}>
                            {item.awardDescription || "N/A"}
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            {sortedSpendingData.length > 5 && (
              <div id="usa-spending-footer">
                  <button id="btn-see-more" onClick={() => setIsSpendingModalOpen(true)}>
                      See More
                  </button>
              </div>
            )}
        </div>
      </div>
      
      {isSpendingModalOpen && (
        <div id="modal-spending" className="modal-overlay" style={{ display: 'block' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>All Government Contracts</h3>
                    <span className="close-btn" onClick={() => setIsSpendingModalOpen(false)}>&times;</span>
                </div>
                <div className="modal-body">
                    <table className="w-full text-sm usa-spending-table">
                        <thead>
                            <tr className="text-muted-foreground border-b border-border">
                                <th className="text-left font-medium pb-2 pr-3 pl-2">Agency</th>
                                <th className="text-left font-medium pb-2 pr-3">Date</th>
                                <th className="text-right font-medium pb-2 pr-3">Amount</th>
                                <th className="text-left font-medium pb-2">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sortedSpendingData.map((item, i) => (
                              <tr key={i} className="hover:bg-accent/50 transition-colors">
                              <td className="py-2.5 pl-2 text-foreground text-xs" title={item.awardingAgencyName}>
                                  {item.awardingAgencyName}
                              </td>
                              <td className="py-2.5 text-muted-foreground text-xs">{formatSpendingDate(item.actionDate)}</td>
                              <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                                  ${item.totalValue.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-muted-foreground text-xs" title={item.awardDescription}>
                                  {item.awardDescription || "N/A"}
                              </td>
                              </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}
