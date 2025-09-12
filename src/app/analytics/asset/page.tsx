"use client";
import * as React from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { Landmark, TrendingUp, Target, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Download, Users, DollarSign, CreditCard, PiggyBank, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PlaceholderCard } from "@/components/dashboard/placeholder-card";
import { AllocationLegend } from "@/components/analytics/AllocationLegend";

const DynamicAssetAllocationDonutChart = dynamic(
  () => import('@/components/charts/asset-allocation-donut-chart').then(mod => mod.AssetAllocationDonutChart),
  { 
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false 
  }
);

const InflowOutflowCard = dynamic(
  () => import("@/components/analytics/InflowOutflowCard"),
  { ssr: false }
);

const metricCardsData = [
    {
      title: "Total AUM",
      value: "$12.5B",
    },
    {
      title: "YTD Return",
      value: "+8.7%",
    },
    {
      title: "Inflows (MTD)",
      value: "$350K",
    },
    {
      title: "Outflows (MTD)",
      value: "$120K",
    },
  ];

const topPerformingAssetsData = [
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology', value: '$1.2M', weight: '9.6%', ytdReturn: '+15.2%' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', value: '$1.1M', weight: '8.8%', ytdReturn: '+12.5%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. A', category: 'Communication Services', value: '$950K', weight: '7.6%', ytdReturn: '+10.8%' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Consumer Discretionary', value: '$800K', weight: '6.4%', ytdReturn: '+9.1%' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Technology', value: '$750K', weight: '6.0%', ytdReturn: '+22.3%' },
];

const allocationData = [
  { label: "US Equities", value: 40, color: "var(--palette-1)" },
  { label: "International Equities", value: 20, color: "var(--palette-2)" },
  { label: "Fixed Income", value: 25, color: "var(--palette-3)" },
  { label: "Alternatives", value: 10, color: "var(--palette-5)" },
  { label: "Cash & Equivalents", value: 5, color: "var(--palette-6)" },
];

export default function AssetAnalyticsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Assets Analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCardsData.map((card, index) => (
          <PlaceholderCard key={index} title={card.title} value={card.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between w-full min-h-[420px]">
              <div className="w-full md:w-1/2 flex items-center justify-center h-[320px] max-h-full">
                <DynamicAssetAllocationDonutChart data={allocationData} />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center items-start mt-6 md:mt-0 md:pl-8">
                <AllocationLegend
                  items={allocationData.map((d) => ({
                    label: d.label,
                    value: `${d.value}%`,
                    color: d.color,
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <InflowOutflowCard />
      </div>

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
                <TableCell 
                   className="text-right font-semibold kpi-value"
                >
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