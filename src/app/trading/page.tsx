
"use client";

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import {
  CandlestickChart,
  LineChart,
  AreaChart as AreaChartIcon,
  Search,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';

// Mock Data for the chart
const mockChartData = [
    { name: '9:30', price: 184.50 }, { name: '10:00', price: 184.80 },
    { name: '10:30', price: 185.10 }, { name: '11:00', price: 184.90 },
    { name: '11:30', price: 185.50 }, { name: '12:00', price: 186.20 },
    { name: '12:30', price: 186.00 }, { name: '1:00', price: 186.50 },
    { name: '1:30', price: 186.30 }, { name: '2:00', price: 186.80 },
    { name: '2:30', price: 187.10 }, { name: '3:00', price: 186.95 },
    { name: '3:30', price: 187.25 }, { name: '4:00', price: 187.40 },
];

export default function TradingChartPage() {
  const [activeChartRange, setActiveChartRange] = React.useState('1D');
  const [activeChartType, setActiveChartType] = React.useState('Line');
  const [activeChartInterval, setActiveChartInterval] = React.useState('5m');

  return (
    <TooltipProvider>
      <main className="h-full flex flex-col p-4 md:p-6 bg-background text-foreground gap-4">
        <div className="flex-1 flex gap-4">
          {/* Main Chart Card (Left Side) */}
          <div className="w-2/3 flex flex-col bg-card rounded-2xl shadow-lg p-4 gap-4">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground">TSLA</h1>
                <span className="text-2xl font-semibold text-foreground">$187.40</span>
                <span className="text-lg font-semibold text-green-400 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1"/>
                  +2.90 (+1.57%)
                </span>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search symbol..."
                  className="pl-9 bg-muted/50 border-none focus:ring-primary w-full sm:w-48"
                />
              </div>
            </header>

            {/* Chart Area */}
            <div 
                className="flex-1 w-full relative rounded-lg overflow-hidden"
                style={{
                  background: "radial-gradient(ellipse at bottom, #9634c8 0%, #18141f 70%, #000 100%)"
                }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background) / 0.9)',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      backdropFilter: 'blur(4px)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartFill)"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Controls Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-muted-foreground mr-2 hidden sm:inline">Range:</span>
                {['1D', '5D', '1M', '3M', 'YTD', '1Y'].map(range => (
                  <Button key={range} size="sm" variant={activeChartRange === range ? 'secondary' : 'ghost'} onClick={() => setActiveChartRange(range)} className="h-8 px-3">{range}</Button>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-muted-foreground mr-2 hidden sm:inline">Interval:</span>
                {['1m', '5m', '30m', '1h', 'D'].map(interval => (
                  <Button key={interval} size="sm" variant={activeChartInterval === interval ? 'secondary' : 'ghost'} onClick={() => setActiveChartInterval(interval)} className="h-8 px-3">{interval}</Button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant={activeChartType === 'Line' ? 'secondary' : 'ghost'} onClick={() => setActiveChartType('Line')} className="h-8 w-8"><LineChart className="h-4 w-4"/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Line Chart</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant={activeChartType === 'Area' ? 'secondary' : 'ghost'} onClick={() => setActiveChartType('Area')} className="h-8 w-8"><AreaChartIcon className="h-4 w-4"/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Area Chart</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant={activeChartType === 'Candle' ? 'secondary' : 'ghost'} onClick={() => setActiveChartType('Candle')} className="h-8 w-8"><CandlestickChart className="h-4 w-4"/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Candlestick Chart</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant='ghost' className="h-8 w-8"><CalendarDays className="h-4 w-4"/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Date Range</p></TooltipContent>
                </Tooltip>
              </div>
            </footer>
          </div>

          {/* Right Side Placeholder Cards */}
          <div className="w-1/3 flex flex-col gap-4">
            <PlaceholderCard title="Placeholder 1" className="h-[150px]">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Blank Card
                </div>
            </PlaceholderCard>
            <PlaceholderCard title="Placeholder 2" className="flex-1">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Blank Card
                </div>
            </PlaceholderCard>
          </div>
        </div>
        
        {/* Bottom Placeholder Cards */}
        <div className="h-1/4 flex gap-4">
            <PlaceholderCard title="Placeholder 3" className="flex-1">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Blank Card
                </div>
            </PlaceholderCard>
            <PlaceholderCard title="Placeholder 4" className="flex-1">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Blank Card
                </div>
            </PlaceholderCard>
        </div>
      </main>
    </TooltipProvider>
  );
}
