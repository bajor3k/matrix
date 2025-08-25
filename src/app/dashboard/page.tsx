
"use client";

import * as React from 'react';
import dynamic from 'next/dynamic';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Newspaper,
  Search,
  Send,
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart4,
  Cpu,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarketData {
  label: string;
  polygonTicker: string;
  icon?: React.ElementType;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
}

const initialMarketOverviewData: MarketData[] = [
  { label: 'Apple (AAPL)', polygonTicker: 'AAPL', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'Microsoft (MSFT)', polygonTicker: 'MSFT', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'S&P 500 (SPY)', polygonTicker: 'SPY', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'Dow Jones (DIA)', polygonTicker: 'DIA', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
];

interface FetchedIndexData {
  c?: number; // Close price
  o?: number; // Open price
  error?: string;
  loading?: boolean;
}

interface MarketStatusInfo {
  statusText: string;
  tooltipText: string;
  shadowClass: string;
}

// Function to fetch index data
const fetchIndexData = async (symbol: string): Promise<FetchedIndexData> => {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  // CRITICAL LOG: Check if the API key is being read.
  console.log(`[Polygon API] Attempting to use API key ending with: ...${apiKey ? apiKey.slice(-4) : 'UNDEFINED'} for symbol: ${symbol}`);

  if (!apiKey) {
    console.error(`[Polygon API Error] NEXT_PUBLIC_POLYGON_API_KEY is UNDEFINED. Please ensure it's set in .env.local and the dev server was restarted.`);
    return { error: 'API Key Missing. Configure in .env.local & restart server.' };
  }

  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`);
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`; // Default message
      try {
        const errorData = await response.json();
        if (Object.keys(errorData).length === 0 && errorData.constructor === Object) {
          console.warn(`[Polygon API Warn] Received empty JSON error object from Polygon for ${symbol}. Status: ${response.status}.`);
          errorMessage = `API Error: ${response.status} - Polygon returned an empty error response.`;
        } else {
          console.log(`[Polygon API Info] Full error response object for ${symbol}:`, errorData); // Changed to log for non-empty error objects
          if (errorData.message) errorMessage = `API Error: ${response.status} - ${errorData.message}`;
          else if (errorData.error) errorMessage = `API Error: ${response.status} - ${errorData.error}`;
          else if (errorData.request_id) errorMessage = `API Error: ${response.status} (Request ID: ${errorData.request_id})`;
          else if (response.statusText && errorMessage === `API Error: ${response.status}`) {
             errorMessage = `API Error: ${response.status} - ${response.statusText}`;
          }
        }
      } catch (e) {
        try {
            const textError = await response.text();
            console.warn(`[Polygon API Warn] Could not parse JSON error response for ${symbol}. Status: ${response.status}. Response text snippet:`, textError.substring(0, 200) + (textError.length > 200 ? '...' : ''));
            errorMessage = `API Error: ${response.status} - ${response.statusText || 'Failed to parse error response as JSON or text.'}`;
        } catch (textE) {
            console.warn(`[Polygon API Warn] Could not parse JSON or text error response for ${symbol}. Status: ${response.status}.`);
            errorMessage = `API Error: ${response.status} - ${response.statusText || 'Unknown error structure and failed to read response text.'}`;
        }
      }
      console.error(`Error fetching ${symbol}: ${errorMessage}`);
      return { error: errorMessage };
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { c, o } = data.results[0];
      return { c, o };
    }
    console.warn(`[Polygon API Warn] No data results found for ${symbol} in Polygon response.`);
    return { error: 'No data from Polygon' };
  } catch (error: any) {
    console.error(`[Polygon API Error] Network/Fetch error for ${symbol}:`, error.message || error);
    return { error: `Fetch error: ${error.message || 'Unknown network error'}` };
  }
};


export default function DashboardPage() {
  const [marketApiData, setMarketApiData] = React.useState<Record<string, FetchedIndexData>>({});
  const [marketStatuses, setMarketStatuses] = React.useState<Record<string, MarketStatusInfo>>({});
  const [currentTimeEST, setCurrentTimeEST] = React.useState<string>('Loading...');

  React.useEffect(() => {
    let isCancelled = false; // Flag to handle cleanup

    const loadMarketData = async () => {
      if (!process.env.NEXT_PUBLIC_POLYGON_API_KEY) {
        console.warn("[Polygon API] CRITICAL: NEXT_PUBLIC_POLYGON_API_KEY is not defined in the environment. Market data will not be fetched. Ensure .env.local is set and the dev server was restarted.");
        const errorState: Record<string, FetchedIndexData> = {};
        initialMarketOverviewData.forEach(market => {
          errorState[market.polygonTicker] = { error: 'API Key Missing. Check .env.local & restart server.' };
        });
        if (!isCancelled) {
          setMarketApiData(errorState);
        }
        return;
      }

      const initialApiData: Record<string, FetchedIndexData> = {};
      initialMarketOverviewData.forEach(market => {
        initialApiData[market.polygonTicker] = { loading: true };
      });
      if (!isCancelled) {
        setMarketApiData(initialApiData);
      }

      // Fetch data sequentially to respect API rate limits (5 reqs/min).
      for (const market of initialMarketOverviewData) {
        if (isCancelled) return;

        const data = await fetchIndexData(market.polygonTicker);

        if (isCancelled) return;

        setMarketApiData(prevData => ({
          ...prevData,
          [market.polygonTicker]: data,
        }));

        // Wait for 15 seconds before the next request to stay well within the 5 reqs/min limit.
        if (initialMarketOverviewData.indexOf(market) < initialMarketOverviewData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
    };

    loadMarketData();

    // Cleanup function to run when the component unmounts
    return () => {
      isCancelled = true;
    };
  }, []);

  const calculateChangePercent = (currentPrice?: number, openPrice?: number) => {
    if (typeof currentPrice !== 'number' || typeof openPrice !== 'number' || openPrice === 0) {
      return null;
    }
    return ((currentPrice - openPrice) / openPrice) * 100;
  };

  React.useEffect(() => {
    const updateMarketStatuses = () => {
      const newStatuses: Record<string, MarketStatusInfo> = {};
      const now = new Date();

      let currentHourEST = 0;
      let currentMinuteEST = 0;

      try {
        const estFormatter = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          timeZone: 'America/New_York',
        });
        const parts = estFormatter.formatToParts(now);
        parts.forEach(part => {
          if (part.type === 'hour') currentHourEST = parseInt(part.value);
          if (part.type === 'minute') currentMinuteEST = parseInt(part.value);
        });
      } catch (e) {
        console.error("Error formatting EST time, defaulting to local time for logic:", e);
        const localNow = new Date();
        currentHourEST = localNow.getHours();
        currentMinuteEST = localNow.getMinutes();
      }
      
      const todayForLogic = new Date(now.toLocaleString('en-US', {timeZone: 'America/New_York'}));
      todayForLogic.setHours(0,0,0,0);


      initialMarketOverviewData.forEach(market => {
        if (market.openTime && market.closeTime) {
          const [openHour, openMinute] = market.openTime.split(':').map(Number);
          const [closeHour, closeMinute] = market.closeTime.split(':').map(Number);

          const marketOpenTime = new Date(todayForLogic);
          marketOpenTime.setHours(openHour, openMinute, 0, 0);

          const marketCloseTime = new Date(todayForLogic);
          marketCloseTime.setHours(closeHour, closeMinute, 0, 0);

          const nowInEstEquivalentForLogic = new Date(todayForLogic);
          nowInEstEquivalentForLogic.setHours(currentHourEST, currentMinuteEST, 0, 0);

          const isCurrentlyOpen =
            nowInEstEquivalentForLogic >= marketOpenTime &&
            nowInEstEquivalentForLogic < marketCloseTime;

          const timeToCloseMs = marketCloseTime.getTime() - nowInEstEquivalentForLogic.getTime();
          const isClosingSoon = isCurrentlyOpen && timeToCloseMs > 0 && timeToCloseMs <= 60 * 60 * 1000; // 1 hour

          let statusText = "🔴 Market Closed";
          let shadowClass = "shadow-market-closed";
          let tooltipText = `Market Hours: ${market.openTime} - ${market.closeTime} ET`;

          if (isClosingSoon) {
            statusText = "🟡 Closing Soon";
            shadowClass = "shadow-market-closing";
            tooltipText = `Market closes at ${market.closeTime} ET`;
          } else if (isCurrentlyOpen) {
            statusText = "🟢 Market Open";
            shadowClass = "shadow-market-open";
            tooltipText = `Market closes at ${market.closeTime} ET`;
          }

          newStatuses[market.label] = { statusText, tooltipText, shadowClass };
        } else {
          newStatuses[market.label] = { statusText: "Status N/A", tooltipText: "Market hours not defined", shadowClass: "" };
        }
      });
      setMarketStatuses(newStatuses);
    };

    updateMarketStatuses();
    const intervalId = setInterval(updateMarketStatuses, 60000);
    const clockIntervalId = setInterval(() => {
      try {
        setCurrentTimeEST(new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        setCurrentTimeEST(new Date().toLocaleTimeString());
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(clockIntervalId);
    };
  }, []);


  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Welcome Josh!
      </h1>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">Market Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialMarketOverviewData.map((market) => {
            const apiResult = marketApiData[market.polygonTicker];
            const statusInfo = marketStatuses[market.label] || { statusText: "Loading...", tooltipText: "Fetching status...", shadowClass: "" };

            let valueDisplay: React.ReactNode = "$0.00";
            let changeDisplay: React.ReactNode = "0.00%";

            if (apiResult?.loading) {
              valueDisplay = <span className="text-sm text-muted-foreground">Loading...</span>;
              changeDisplay = <span className="text-xs text-muted-foreground">Loading...</span>;
            } else if (apiResult?.error) {
              valueDisplay = <span className="text-sm text-red-400/80 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {apiResult.error}</span>;
              changeDisplay = "";
            } else if (apiResult?.c !== undefined && apiResult?.o !== undefined) {
              valueDisplay = `$${apiResult.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              const percentChange = calculateChangePercent(apiResult.c, apiResult.o);
              if (percentChange !== null) {
                const changeType = percentChange >= 0 ? 'up' : 'down';
                changeDisplay = (
                  <span className={cn("text-sm font-semibold", changeType === 'up' ? 'text-green-400' : 'text-red-400')}>
                    {changeType === 'up' ? <TrendingUp className="inline-block w-4 h-4 mr-1" /> : <TrendingDown className="inline-block w-4 h-4 mr-1" />}
                    {percentChange.toFixed(2)}%
                  </span>
                );
              } else {
                changeDisplay = <span className="text-xs text-muted-foreground">N/A</span>;
              }
            }

            return (
              <PlaceholderCard
                key={market.polygonTicker}
                title={market.label}
                icon={market.icon || Landmark}
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  statusInfo.shadowClass
                )}
              >
                <div className="text-2xl font-bold text-foreground mb-1">{valueDisplay}</div>
                <div className="text-sm mb-3">{changeDisplay}</div>
                <div className="h-10 w-full my-2 bg-black/30 rounded-md flex items-center justify-center backdrop-blur-sm" data-ai-hint="mini trendline chart">
                  <span className="text-xs text-muted-foreground/50">Mini Trend</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/20 flex justify-between items-center">
                        <span>{statusInfo.statusText}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{currentTimeEST.replace(/\s(AM|PM)/, '')}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                      <p>{statusInfo.tooltipText}</p>
                      {apiResult?.c !== undefined && <p>Prev. Close: ${apiResult.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      {apiResult?.o !== undefined && <p>Prev. Open: ${apiResult.o.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PlaceholderCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
