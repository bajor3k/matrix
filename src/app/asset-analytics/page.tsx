
"use client";
import * as React from "react";
import Image from "next/image";
import { Landmark, TrendingUp, Target, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Download, Users, DollarSign, CreditCard, PiggyBank } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { AssetAllocationDonutChart } from '@/components/charts/asset-allocation-donut-chart';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const metricCardsData = [
  {
    title: "Total AUM",
    value: "$12.5B",
    description: React.createElement('span', { className: 'text-green-400 text-sm' }, '+15.8% from last quarter'),
    icon: PiggyBank,
    iconClassName: "text-green-500",
  },
  {
    title: "YTD Return",
    value: "+8.7%",
    description: "vs. Benchmark +7.1%",
    icon: TrendingUp,
  },
  {
    title: "% in Model Portfolios",
    value: "72%",
    description: "Target 80%",
    icon: Target,
  },
  {
    title: "Inflows (MTD)",
    value: "$350K",
    description: "+15% from last month",
    icon: ArrowDownCircle,
  },
  {
    title: "Outflows (MTD)",
    value: "$120K",
    description: "-5% from last month",
    icon: ArrowUpCircle,
  },
  {
    title: "Net Flows (MTD)",
    value: "$230K",
    description: "Net positive inflow",
    icon: ArrowRightLeft,
  },
];

const assetBreakdownData = [
  { name: "US Equities", percentage: "40%", color: "bg-[hsl(var(--chart-1))]" },
  { name: "International Equities", percentage: "20%", color: "bg-[hsl(var(--chart-2))]" },
  { name: "Fixed Income", percentage: "25%", color: "bg-[hsl(var(--chart-3))]" },
  { name: "Alternatives", percentage: "10%", color: "bg-[hsl(var(--chart-4))]" },
  { name: "Cash & Equivalents", percentage: "5%", color: "bg-[hsl(var(--chart-5))]" },
];

const topPerformingAssetsData = [
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', value: '$1.2M', weight: '9.6%', ytdReturn: '+15.2%' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', value: '$1.1M', weight: '8.8%', ytdReturn: '+12.5%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. A', category: 'Communication Services', value: '$950K', weight: '7.6%', ytdReturn: '+10.8%' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Consumer Discretionary', value: '$800K', weight: '6.4%', ytdReturn: '+9.1%' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Technology', value: '$750K', weight: '6.0%', ytdReturn: '+22.3%' },
];


export default function AssetAnalyticsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Assets Analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <PlaceholderCard title="Advisor">
          <Select>
            <SelectTrigger id="advisor-select" className="w-full bg-muted border border-border text-foreground shadow-inner transition-colors hover:border-primary focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Select Advisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mike_mcdermott_mam">Mike McDermott MAM</SelectItem>
              <SelectItem value="sam_rothstein_sar">Sam Rothstein SAR</SelectItem>
            </SelectContent>
          </Select>
        </PlaceholderCard>
        <PlaceholderCard title="Custodian">
          <Select defaultValue="all_custodians">
            <SelectTrigger id="custodian-select" className="w-full bg-muted border border-border text-foreground shadow-inner transition-colors hover:border-primary focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Select Custodian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_custodians">All Custodians</SelectItem>
              <SelectItem value="pershing">Pershing</SelectItem>
              <SelectItem value="schwab">Charles Schwab</SelectItem>
              <SelectItem value="fidelity">Fidelity</SelectItem>
              <SelectItem value="goldman">Goldman Sachs</SelectItem>
              <SelectItem value="pas">PAS</SelectItem>
            </SelectContent>
          </Select>
        </PlaceholderCard>
        <PlaceholderCard title="Timeframe">
          <Select defaultValue="ytd">
            <SelectTrigger id="timeframe-select" className="w-full bg-muted border border-border text-foreground shadow-inner transition-colors hover:border-primary focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="trailing_12m">Trailing 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </PlaceholderCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metricCardsData.map((card, index) => (
          <PlaceholderCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            iconClassName={card.iconClassName}
          />
        ))}
      </div>

      <PlaceholderCard title="Asset Allocation by Type">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[400px] md:h-[450px] w-full">
              <AssetAllocationDonutChart />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground mb-4">Asset Breakdown</h3>
              {assetBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-base hover:bg-primary/10 rounded-md p-1 -m-1 transition-colors duration-150 ease-out">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-sm ${item.color}`}></span>
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>
      </PlaceholderCard>

      <PlaceholderCard title="Top Performing Assets">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">YTD Return</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPerformingAssetsData.map((asset) => (
              <TableRow key={asset.symbol}>
                <TableCell className="font-medium">{asset.symbol}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell className="text-muted-foreground">{asset.category}</TableCell>
                <TableCell className="text-right">{asset.value}</TableCell>
                <TableCell className="text-right">{asset.weight}</TableCell>
                <TableCell className={`text-right font-semibold ${asset.ytdReturn.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.ytdReturn}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
        </div>
      </PlaceholderCard>
    </main>
  );
}
