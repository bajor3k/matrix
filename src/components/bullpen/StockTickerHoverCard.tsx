"use client";

import { useState, useEffect } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface StockData {
    c: number;  // Current price
    d: number;  // Change
    dp: number; // Percent change
}

interface StockTickerHoverCardProps {
    ticker: string;
    children: React.ReactNode;
}

export function StockTickerHoverCard({ ticker, children }: StockTickerHoverCardProps) {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shouldFetch, setShouldFetch] = useState(false);

    useEffect(() => {
        if (!shouldFetch) return;

        const fetchStockData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/external/quote?symbol=${ticker}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Stock API error:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch stock data');
                }

                const data = await response.json();
                console.log('Stock data received:', data);

                // Validate the data
                if (data.c === 0 || data.c === undefined) {
                    throw new Error('Invalid ticker symbol');
                }

                setStockData(data);
            } catch (err) {
                console.error('Stock ticker error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStockData();
    }, [ticker, shouldFetch]);

    const handleOpenChange = (open: boolean) => {
        if (open && !stockData && !isLoading) {
            setShouldFetch(true);
        }
    };

    const isPositive = stockData ? stockData.d >= 0 : false;
    const changeColor = isPositive ? "text-emerald-500" : "text-red-500";

    return (
        <HoverCard onOpenChange={handleOpenChange} openDelay={200}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-64" side="top">
                {isLoading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {error && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                        Unable to load stock data
                    </div>
                )}

                {stockData && !isLoading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                {ticker}
                            </span>
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                                ${stockData.c.toFixed(2)}
                            </span>
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-medium ${changeColor}`}>
                            <span>
                                {isPositive ? '+' : ''}{stockData.d.toFixed(2)}
                            </span>
                            <span>
                                ({isPositive ? '+' : ''}{stockData.dp.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
