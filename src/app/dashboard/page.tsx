
"use client";

import { useMemo, useEffect, useState } from "react";
import { CalendarDays, Clock, Loader2, TrendingUp, TrendingDown, DollarSign, Activity, Eye, ArrowUpRight, ArrowDownRight, BarChart3, ExternalLink, Search } from "lucide-react";
import StockCard from "@/components/StockCard";
// Alias the UI Card to avoid conflict with your local Card component below
import { Card as UiCard, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  title: string;
  url: string;
  time_published: string;
  summary: string;
  banner_image: string;
  source: string;
  overall_sentiment_label: string;
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

interface TreasuryDataPoint {
  date: string;
  value: string;
}

interface CpiDataPoint {
  date: string;
  value: string;
}

interface FedFundsDataPoint {
  date: string;
  value: string;
}

interface MarketMover {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

interface MarketMoversData {
  top_gainers: MarketMover[];
  top_losers: MarketMover[];
  most_actively_traded: MarketMover[];
}

type FedEvent = { date: string; timeET?: string; event: string; note?: string };
type Earning = { date: string; ticker: string; company: string; time: "BMO" | "AMC" | "TBD" };

interface QuoteData {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
}


/* ----------------------- Dummy Data (Static) ----------------------- */
const FED_DATES_DUMMY: FedEvent[] = [
  { date: "2025-11-20", timeET: "2:00 PM", event: "FOMC Minutes", note: "October meeting minutes release" },
  { date: "2025-12-11", timeET: "2:00 PM", event: "FOMC Rate Decision", note: "Press conference 2:30 PM" },
  { date: "2026-01-08", timeET: "8:30 AM", event: "Fed Chair Remarks", note: "Prepared remarks at policy forum" },
];

/* ----------------------- Helpers ----------------------- */

function parseNewsDate(dateString: string) {
  if (!dateString || dateString.length < 15) return new Date();
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1;
  const day = parseInt(dateString.substring(6, 8));
  const hour = parseInt(dateString.substring(9, 11));
  const minute = parseInt(dateString.substring(11, 13));
  const second = parseInt(dateString.substring(13, 15));
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function timeAgo(dateInput: string | number | Date) {
  const date = typeof dateInput === 'string' ? parseNewsDate(dateInput) : new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 3600;
  if (interval > 24) return Math.floor(interval / 24) + "d ago";
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

const formatSpendingDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}.${day}.${year}`;
};

const formatIpoDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}.${day}.${year}`;
};

const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'QQQ', name: 'Nasdaq' },
  { symbol: 'IYM', name: 'Russell 2000' }
];


/* ----------------------- Card Shell ----------------------- */
function Card({
  title, icon, children, action, className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground ${className}`}>
      {/* Updated Header: Removed justify-between, added gap-4 */}
      <div className="flex items-center border-b border-border px-4 py-3 gap-4">
        <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ----------------------- Page ----------------------- */
export default function DashboardPage() {
  const fedRows = useMemo(() => FED_DATES_DUMMY, []);
  
  // State
  const [marketIndicesData, setMarketIndicesData] = useState<Record<string, any>>({});
  const [marketStatusData, setMarketStatusData] = useState<MarketStatus | null>(null);
  const [nextHoliday, setNextHoliday] = useState<MarketHoliday | null>(null);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [newsTicker, setNewsTicker] = useState(""); // For the input field
  const [newsSentiment, setNewsSentiment] = useState("All");
  const [loadingNews, setLoadingNews] = useState(false);
  
  const [ipos, setIpos] = useState<IpoEvent[]>([]);
  const [usaSpending, setUsaSpending] = useState<UsaSpendingData | null>(null);
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Macro Data State
  const [treasuryData, setTreasuryData] = useState<TreasuryDataPoint[]>([]);
  const [cpiData, setCpiData] = useState<CpiDataPoint[]>([]);
  const [fedFundsData, setFedFundsData] = useState<FedFundsDataPoint[]>([]);
  const [marketMovers, setMarketMovers] = useState<MarketMoversData | null>(null);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);


  // Fetch All Data on Mount
  useEffect(() => {
    // 1. Market Status
    fetch("/api/external/market-status")
      .then((res) => res.json())
      .then((data) => !data.error && setMarketStatusData(data))
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

    // 3. Initial News Fetch (General)
    fetchNews("", "All");
    
    // 4. Market Movers (Top Gainers/Losers)
    fetch("/api/external/top-gainers-losers")
      .then((res) => res.json())
      .then((data) => {
          if (!data.error && data.top_gainers) {
              setMarketMovers(data);
          }
      })
      .catch((err) => console.error("Movers fetch error", err));

    // 5. IPO Calendar
    fetch("/api/external/ipo-calendar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
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

    // 7. Market Indices
    const fetchMarketData = async () => {
      const promises = MARKET_INDICES.map(async (index) => {
        try {
          const res = await fetch(`/api/external/quote?symbol=${index.symbol}`);
          if (!res.ok) return { symbol: index.symbol, data: null };
          const data = await res.json();
          return { symbol: index.symbol, data };
        } catch (e) {
          console.error(`Error fetching ${index.symbol}`, e);
          return { symbol: index.symbol, data: null };
        }
      });

      const results = await Promise.all(promises);
      const newMarketData: Record<string, any> = {};
      results.forEach((item) => {
        if (item.data) {
          newMarketData[item.symbol] = item.data;
        }
      });
      setMarketIndicesData(newMarketData);
    };

    fetchMarketData();

    // 8. Treasury Yield (10 Year)
    fetch("/api/external/treasury-yield?maturity=10year&interval=monthly")
        .then(res => res.json())
        .then(data => {
            if (data.data) {
                setTreasuryData(data.data);
            }
        })
        .catch(err => console.error("Treasury fetch error", err));

    // 9. CPI Data
    fetch("/api/external/cpi?interval=monthly")
        .then(res => res.json())
        .then(data => {
            if (data.data) {
                setCpiData(data.data);
            }
        })
        .catch(err => console.error("CPI fetch error", err));

    // 10. Federal Funds Rate
    fetch("/api/external/federal-funds-rate?interval=monthly")
        .then(res => res.json())
        .then(data => {
            if (data.data) {
                setFedFundsData(data.data);
            }
        })
        .catch(err => console.error("Fed Funds fetch error", err));

  }, []);

  // --- Functions ---

  const fetchNews = async (ticker?: string, sentiment?: string) => {
    setLoadingNews(true);
    // Determine effective ticker and sentiment to use
    const t = ticker !== undefined ? ticker : newsTicker;
    const s = sentiment !== undefined ? sentiment : newsSentiment;

    let url = "/api/external/market-news?sort=LATEST";
    if (t) {
        url += `&tickers=${t}`;
    }
    if (s && s !== 'All') {
        url += `&sentiment=${s}`;
    }
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
            setNews(data);
        } else {
            setNews([]); // Clear if no results
        }
    } catch (err) {
        console.error("News fetch error", err);
    } finally {
        setLoadingNews(false);
    }
  };

  const handleNewsSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          fetchNews(newsTicker, newsSentiment);
      }
  };

  const handleNewsTabChange = (value: string) => {
      setNewsSentiment(value);
      fetchNews(newsTicker, value);
  };

  const handleMoverClick = (ticker: string) => {
      setNewsTicker(ticker); // Populate the search box
      fetchNews(ticker, newsSentiment);     // Trigger the news search
  };
  
  const sortedSpendingData = useMemo(() => {
    if (!usaSpending?.data) return [];
    return [...usaSpending.data].sort((a,b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime());
  }, [usaSpending]);

  const previewSpendingData = useMemo(() => sortedSpendingData.slice(0, 5), [sortedSpendingData]);

  // --- Macro Data Calculations ---
  
  const currentTreasuryYield = useMemo(() => {
    if (!treasuryData || treasuryData.length === 0) return null;
    return treasuryData[0].value;
  }, [treasuryData]);

  const currentCPI = useMemo(() => {
    if (!cpiData || cpiData.length === 0) return null;
    return cpiData[0].value;
  }, [cpiData]);

  const currentFedFundsRate = useMemo(() => {
    if (!fedFundsData || fedFundsData.length === 0) return null;
    return fedFundsData[0].value;
  }, [fedFundsData]);

  const currentInflation = useMemo(() => {
    if (!cpiData || cpiData.length < 13) return null;
    // Calculate YoY Inflation: ((Current CPI - CPI 12 months ago) / CPI 12 months ago) * 100
    const current = parseFloat(cpiData[0].value);
    const lastYear = parseFloat(cpiData[12].value); // Approx 1 year ago monthly
    if (isNaN(current) || isNaN(lastYear) || lastYear === 0) return null;
    
    const inflation = ((current - lastYear) / lastYear) * 100;
    return inflation.toFixed(2);
  }, [cpiData]);
  
  const handleTickerClick = async (ticker: string) => {
    setSelectedTicker(ticker);
    setLoadingQuote(true);
    setIsDialogOpen(true);

    try {
      const res = await fetch(`/api/external/quote?symbol=${ticker}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuoteData(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fmt = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  // Reusable Component for the Macro Indicators
  const MacroCard = ({ title, value, subtext }: { title: string, value: string, subtext?: string }) => (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {subtext && <span className="text-xs text-muted-foreground opacity-50">{subtext}</span>}
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    </div>
  );

  // Sub-component for rendering mover rows
  const MoverRow = ({ mover, type }: { mover: MarketMover, type: 'gainer' | 'loser' | 'active' }) => {
      const isPositive = parseFloat(mover.change_percentage) >= 0;
      return (
        <div 
            className="grid grid-cols-4 gap-2 px-2 py-2 border-b border-border last:border-0 hover:bg-accent/50 rounded-md transition-colors cursor-pointer items-center" 
            onClick={() => handleMoverClick(mover.ticker)}
        >
            <div className="font-semibold text-sm text-left">{mover.ticker}</div>
            <div className="text-right text-xs text-muted-foreground opacity-90">{parseInt(mover.volume).toLocaleString()}</div>
            <div className="text-right text-sm font-medium">${parseFloat(mover.price).toFixed(2)}</div>
            <div className={`text-right text-xs font-medium flex items-center justify-end ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {parseFloat(mover.change_percentage).toFixed(2)}%
            </div>
        </div>
      );
  }


  return (
    <main className="p-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Welcome Josh</h1>

        {/* Market Status Component */}
        {marketStatusData && (
          <UiCard className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex items-center gap-6 text-base">
              {/* Status Section */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    {marketStatusData.isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    {!marketStatusData.isOpen && marketStatusData.session === 'post-market' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      marketStatusData.isOpen 
                        ? 'bg-emerald-500' 
                        : (marketStatusData.session === 'post-market' ? 'bg-red-500' : 'bg-gray-400')
                    }`}></span>
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {marketStatusData.isOpen 
                      ? "Market Open" 
                      : (marketStatusData.session 
                          ? marketStatusData.session.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) 
                          : "Closed")}
                  </span>
                </div>
              </div>

              {/* Holiday Section */}
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

      {/* Row 1: Market Indices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MARKET_INDICES.map((item) => {
          const quote = marketIndicesData[item.symbol];
          const isPositive = quote?.d >= 0;

          return (
            <div key={item.symbol} className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="p-6 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground opacity-50 font-mono">{item.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {quote ? `$${quote.c.toFixed(2)}` : <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />}
                  </div>
                  {quote ? (
                    <div className={`text-xs font-medium mt-1 ${isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      {isPositive ? "+" : ""}{quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
                    </div>
                  ) : (
                    <div className="mt-2 h-3 w-16 ml-auto animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Macro Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MacroCard 
            title="Treasury Yield" 
            value={currentTreasuryYield ? `${currentTreasuryYield}%` : "--"} 
            subtext="10-Year Constant Maturity" 
        />
        <MacroCard 
            title="CPI" 
            value={currentCPI ? currentCPI : "--"} 
            subtext="Consumer Price Index" 
        />
        <MacroCard 
            title="Inflation" 
            value={currentInflation ? `${currentInflation}%` : "--"} 
            subtext="Year over Year" 
        />
        <MacroCard 
            title="Federal Funds Rate" 
            value={currentFedFundsRate ? `${currentFedFundsRate}%` : "--"} 
            subtext="Target Rate" 
        />
      </div>

      {/* Main Grid: Gainers/Losers Left, News Right */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Top Gainers & Losers */}
        <Tabs defaultValue="gainers" className="flex flex-col h-full w-full">
            <Card 
                title="Market Movers" 
                className="min-h-[360px] h-full flex flex-col"
                action={
                    <div className="ml-auto">
                        <TabsList className="bg-transparent p-0 gap-1 h-auto">
                            <TabsTrigger 
                                value="gainers" 
                                className="h-6 rounded-md px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-bold bg-transparent data-[state=active]:bg-transparent transition-all"
                            >
                                Gainers
                            </TabsTrigger>
                            <TabsTrigger 
                                value="losers" 
                                className="h-6 rounded-md px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-bold bg-transparent data-[state=active]:bg-transparent transition-all"
                            >
                                Losers
                            </TabsTrigger>
                            <TabsTrigger 
                                value="active" 
                                className="h-6 rounded-md px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-bold bg-transparent data-[state=active]:bg-transparent transition-all"
                            >
                                Active
                            </TabsTrigger>
                        </TabsList>
                    </div>
                }
            >
                {!marketMovers ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span className="text-sm italic">Loading market data...</span>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Static Header Row */}
                        <div className="grid grid-cols-4 gap-2 px-2 py-2 text-[10px] font-semibold text-muted-foreground border-b border-border uppercase tracking-wider">
                            <div className="text-left">Ticker</div>
                            <div className="text-right">Volume</div>
                            <div className="text-right">Price</div>
                            <div className="text-right">Change</div>
                        </div>

                        {/* Scrollable Rows */}
                        <div className="overflow-y-auto pr-2">
                            <TabsContent value="gainers" className="mt-0 space-y-0">
                                {marketMovers.top_gainers.slice(0, 10).map((m, i) => <MoverRow key={i} mover={m} type="gainer" />)}
                            </TabsContent>
                            <TabsContent value="losers" className="mt-0 space-y-0">
                                {marketMovers.top_losers.slice(0, 10).map((m, i) => <MoverRow key={i} mover={m} type="loser" />)}
                            </TabsContent>
                            <TabsContent value="active" className="mt-0 space-y-0">
                                {marketMovers.most_actively_traded.slice(0, 10).map((m, i) => <MoverRow key={i} mover={m} type="active" />)}
                            </TabsContent>
                        </div>
                    </div>
                )}
            </Card>
        </Tabs>

        {/* Market News (With Search & Sentiment Tabs) */}
        <Card 
            title="Market News" 
            className="min-h-[360px] h-full"
            action={
                <div className="flex items-center gap-2 ml-auto">
                    <Tabs defaultValue="All" value={newsSentiment} onValueChange={handleNewsTabChange} className="w-auto">
                        <TabsList className="bg-transparent p-0 gap-1 h-auto">
                            {["All", "Bullish", "Neutral", "Bearish"].map((sentiment) => (
                                <TabsTrigger 
                                    key={sentiment}
                                    value={sentiment} 
                                    className="h-6 rounded-md px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-bold bg-transparent data-[state=active]:bg-transparent transition-all"
                                >
                                    {sentiment}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            placeholder="Ticker..." 
                            value={newsTicker}
                            onChange={(e) => setNewsTicker(e.target.value.toUpperCase())}
                            onKeyDown={handleNewsSearch}
                            className="h-6 w-[80px] pl-7 text-[10px] bg-background/50 border-border/50 focus:w-[120px] transition-all"
                        />
                    </div>
                </div>
            }
        >
          <div className="space-y-3">
            {loadingNews ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-sm italic">Searching news...</span>
                </div>
            ) : news.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                  No recent news found.
              </div>
            ) : (
              news.slice(0, 6).map((n, i) => (
                <div
                  key={i}
                  className="group rounded-lg border border-border bg-background/50 p-3 hover:border-primary/20 transition-colors cursor-pointer"
                  onClick={() => window.open(n.url, '_blank')}
                >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm text-foreground leading-5 font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {n.title}
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(n.time_published)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="text-[11px] text-muted-foreground font-semibold">{n.source}</div>
                          {n.overall_sentiment_label && (
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] px-1.5 py-0 border-none 
                                    ${n.overall_sentiment_label === 'Bullish' || n.overall_sentiment_label === 'Somewhat-Bullish' ? 'bg-green-500/10 text-green-500' : 
                                      n.overall_sentiment_label === 'Bearish' || n.overall_sentiment_label === 'Somewhat-Bearish' ? 'bg-red-500/10 text-red-500' : 
                                      'bg-slate-500/10 text-slate-500'}`}
                              >
                                {n.overall_sentiment_label}
                              </Badge>
                          )}
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-50" />
                    </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

       {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* IPO Calendar */}
        <Card title="IPO Calendar">
          <div className="overflow-x-auto">
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
                ipos.map((ipo, i) => {
                  const isPriced = ipo.status?.toLowerCase() === 'priced';
                  const capitalizedStatus = ipo.status ? ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1) : '';
                  return (
                    <tr key={i} className="hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 pl-2 text-foreground text-xs">{formatIpoDate(ipo.date)}</td>
                    <td className="py-2.5 pr-3">
                      <div
                        onClick={() => isPriced && handleTickerClick(ipo.symbol)}
                        className={`
                          font-medium text-blue-600 
                          ${isPriced ? 'cursor-pointer hover:underline' : 'cursor-default'}
                        `}
                      >
                        {ipo.symbol || "—"}
                      </div>
                    </td>
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
                        {capitalizedStatus}
                        </Badge>
                    </td>
                    </tr>
                  );
                })
                )}
            </tbody>
            </table>
          </div>
        </Card>

        {/* USA Spending */}
        <Card title="USA Spending">
          <div className="overflow-y-auto">
            <table className="w-full text-sm">
            <thead>
                <tr className="text-muted-foreground border-b border-border">
                <th className="text-left font-medium pb-2 pr-3 pl-2">Agency</th>
                <th className="text-left font-medium pb-2 pr-3">Date</th>
                <th className="text-right font-medium pb-2 pr-3">Amount</th>
                <th className="text-left font-medium pb-2 pl-4">Description</th>
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
                    <td className="py-2.5 pl-4 text-muted-foreground text-xs truncate max-w-[150px]" title={item.awardDescription}>
                        {item.awardDescription || "N/A"}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
          </div>
          {sortedSpendingData.length > 5 && (
            <div className="border-t border-border mt-auto p-2 text-center">
              <button className="text-xs font-medium text-muted-foreground hover:text-foreground w-full py-1" onClick={() => setIsSpendingModalOpen(true)}>
                  See More
              </button>
            </div>
          )}
        </Card>
      </div>
      
      {/* ----------------- MODALS ----------------- */}

      {/* USA Spending Modal */}
      {isSpendingModalOpen && (
        <div id="modal-spending" className="modal-overlay" style={{ display: 'block' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>All Government Contracts</h3>
                    <span className="close-btn" onClick={() => setIsSpendingModalOpen(false)}>&times;</span>
                </div>
                <div className="modal-body">
                    <table className="w-full text-sm usa-spending-table">
                        <thead className="bg-card sticky top-0">
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
                              <td className="py-2.5 pl-2 text-foreground text-xs truncate max-w-[250px]" title={item.awardingAgencyName}>
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

      {/* Treasury Yield Modal (Hidden until See More implementation restored later) */}
      <Dialog open={isTreasuryModalOpen} onOpenChange={setIsTreasuryModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white/20 dark:bg-slate-950/30 backdrop-blur-xl border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
               10-Year Treasury Yield History
            </DialogTitle>
            <DialogDescription>
                Historical yield data (Monthly)
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <table className="w-full text-sm">
                <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
                    <tr className="border-b border-white/10 text-slate-500 dark:text-slate-400">
                        <th className="text-left py-3 pl-2 font-medium">Date</th>
                        <th className="text-right py-3 pr-2 font-medium">Yield (%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {treasuryData.map((point, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 pl-2 text-slate-900 dark:text-white">{point.date}</td>
                            <td className="py-2.5 pr-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                {point.value}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/20 dark:bg-slate-950/30 backdrop-blur-xl border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
              {selectedTicker} 
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 border-0">
                Real-Time
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {loadingQuote ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
          ) : quoteData ? (
            <div className="space-y-6 pt-2">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                  {fmt(quoteData.c)}
                </div>
                <div className={`flex items-center gap-1 text-lg font-semibold drop-shadow-sm ${quoteData.d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {quoteData.d >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  <span>{quoteData.d > 0 ? '+' : ''}{quoteData.d.toFixed(2)} ({quoteData.dp.toFixed(2)}%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Open</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{fmt(quoteData.o)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Prev Close</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{fmt(quoteData.pc)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Day High</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{fmt(quoteData.h)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Day Low</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{fmt(quoteData.l)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Unable to load quote data.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}