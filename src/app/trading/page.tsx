
"use client";

import * as React from 'react';
import {
  ArrowRightLeft,
  CandlestickChart,
  CheckCircle,
  Clock,
  Eye,
  ListChecks,
  Package,
  Plus,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock Data
const mockAccounts = [
  { id: 'acc1', label: 'IRA-XXXX6789', balance: '$1,250,000.00' },
  { id: 'acc2', label: 'JNT-XXXX1234', balance: '$75,500.00' },
  { id: 'acc3', label: 'TRST-XXXX5555', balance: '$5,600,000.00' },
];

const mockWatchlist = [
  { symbol: 'PLTR', name: 'Palantir Technologies', price: 24.10, change: -0.50, changePct: -2.0 },
  { symbol: 'SNOW', name: 'Snowflake Inc.', price: 150.70, change: 1.20, changePct: 0.8 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 184.50, change: 2.15, changePct: 1.18 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 161.90, change: -1.25, changePct: -0.77 },
];

const mockOrders = [
  { id: 'ord1', symbol: 'GOOGL', action: 'Buy', status: 'Executed', qty: 10, type: 'Limit @ 140.50', timestamp: '2024-07-08T10:30:00Z' },
  { id: 'ord2', symbol: 'TSLA', action: 'Sell', status: 'Open', qty: 20, type: 'Market', timestamp: '2024-07-08T13:45:00Z' },
  { id: 'ord3', symbol: 'AMZN', action: 'Buy', status: 'Cancelled', qty: 5, type: 'Stop 175.00', timestamp: '2024-07-07T11:00:00Z' },
];

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10"><Clock className="mr-1 h-3 w-3"/>{status}</Badge>;
    case 'executed':
      return <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10"><CheckCircle className="mr-1 h-3 w-3"/>{status}</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-muted-foreground border-border bg-muted/50"><XCircle className="mr-1 h-3 w-3"/>{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export default function TradingPage() {
  return (
    <TooltipProvider>
      <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8 bg-background">
         <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CandlestickChart className="h-8 w-8 text-primary"/>
          Trading Center
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Account Overview Card */}
                <Card id="account-overview" className="shadow-card-custom border-transparent">
                    <CardHeader>
                        <CardTitle>Account Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select defaultValue="acc1">
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {mockAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="text-sm space-y-2">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Cash Balance:</span>
                                <span>$150,234.56</span>
                           </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Buying Power:</span>
                                <span>$300,469.12</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Margin Available:</span>
                                <span>$150,234.56</span>
                           </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order History Card */}
                <Card id="order-history" className="shadow-card-custom border-transparent">
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>Recent account orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                           {mockOrders.map(order => (
                               <div key={order.id} className="p-2 bg-muted/20 border border-border/30 rounded-md text-xs">
                                   <div className="flex justify-between items-center">
                                       <span className="font-semibold text-foreground">{order.symbol}</span>
                                       {getStatusBadge(order.status)}
                                   </div>
                                   <div className="text-muted-foreground flex justify-between mt-1">
                                       <span>{order.action} {order.qty}</span>
                                       <span>{order.type}</span>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Center Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                 {/* Trade Ticket Card */}
                <Card id="trade-ticket" className="shadow-card-custom border-transparent h-full">
                    <CardHeader>
                        <CardTitle>Trade Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="symbol-input">Symbol</Label>
                            <Input id="symbol-input" placeholder="e.g., AAPL" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <Label htmlFor="action-select">Action</Label>
                               <Select defaultValue="buy">
                                 <SelectTrigger id="action-select"><SelectValue/></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="buy">Buy</SelectItem>
                                   <SelectItem value="sell">Sell</SelectItem>
                                 </SelectContent>
                               </Select>
                            </div>
                            <div>
                                <Label htmlFor="quantity-input">Quantity</Label>
                                <Input id="quantity-input" type="number" placeholder="0" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                 <Label htmlFor="order-type-select">Order Type</Label>
                                 <Select defaultValue="market">
                                   <SelectTrigger id="order-type-select"><SelectValue /></SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="market">Market</SelectItem>
                                     <SelectItem value="limit">Limit</SelectItem>
                                     <SelectItem value="stop">Stop</SelectItem>
                                   </SelectContent>
                                 </Select>
                            </div>
                            <div>
                                 <Label htmlFor="price-input">Price</Label>
                                 <Input id="price-input" placeholder="Market" disabled />
                            </div>
                        </div>
                         <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                            Estimated Cost: $0.00
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline">Review Order</Button>
                            <Button className="bg-primary hover:bg-primary/90">Submit</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

             {/* Right Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                 {/* Watchlist Card */}
                <Card id="watchlist" className="shadow-card-custom border-transparent">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Watchlist</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4"/></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                           {mockWatchlist.map(item => (
                                <div key={item.symbol} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/20">
                                   <div>
                                     <p className="font-bold">{item.symbol}</p>
                                     <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                                   </div>
                                    <div className="text-right">
                                        <p>{formatCurrency(item.price)}</p>
                                         <p className={cn("text-xs", item.change > 0 ? 'text-green-400' : 'text-red-400')}>
                                            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePct.toFixed(1)}%)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 {/* Trading Chart Card */}
                <Card id="chart" className="shadow-card-custom border-transparent h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Chart</CardTitle>
                        <CardDescription>Real-time market data for selected symbol</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center bg-black/30 m-4 rounded-md">
                        <CandlestickChart className="h-16 w-16 text-muted-foreground/30" />
                        <p className="text-muted-foreground/50 ml-4">Chart placeholder</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
