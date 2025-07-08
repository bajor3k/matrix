
"use client";

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  CandlestickChart,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Search,
  Settings,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock Data
const mockAccounts = [
  { id: 'acc1', label: 'IRA-XXXX6789', balance: '$1,250,000.00' },
  { id: 'acc2', label: 'JNT-XXXX1234', balance: '$75,500.00' },
  { id: 'acc3', label: 'TRST-XXXX5555', balance: '$5,600,000.00' },
];

const mockPositions = [
  { symbol: 'AAPL', name: 'Apple Inc.', qty: 100, price: 175.2, value: 17520, gainLoss: 2500.50, gainLossPct: 16.6 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', qty: 50, price: 410.8, value: 20540, gainLoss: -500.10, gainLossPct: -2.3 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', qty: 25, price: 880.0, value: 22000, gainLoss: 8000.00, gainLossPct: 57.1 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', qty: 200, price: 250.5, value: 50100, gainLoss: 10200.00, gainLossPct: 25.5 },
];

const mockOrders = [
  { id: 'ord1', symbol: 'GOOGL', action: 'Buy', status: 'Executed', qty: 10, type: 'Limit @ 140.50', timestamp: '2024-07-08T10:30:00Z' },
  { id: 'ord2', symbol: 'TSLA', action: 'Sell', status: 'Open', qty: 20, type: 'Market', timestamp: '2024-07-08T13:45:00Z' },
  { id: 'ord3', symbol: 'AMZN', action: 'Buy', status: 'Cancelled', qty: 5, type: 'Stop 175.00', timestamp: '2024-07-07T11:00:00Z' },
];

const mockMarketMovers = [
  { symbol: 'UPST', name: 'Upstart Holdings', price: 25.50, change: 2.10, changePct: 9.0 },
  { symbol: 'COIN', name: 'Coinbase Global', price: 220.80, change: 15.60, changePct: 7.6 },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 27.50, change: -1.80, changePct: -6.1 },
];

const mockWatchlist = [
  { symbol: 'PLTR', name: 'Palantir Technologies', price: 24.10, change: -0.50, changePct: -2.0 },
  { symbol: 'SNOW', name: 'Snowflake Inc.', price: 150.70, change: 1.20, changePct: 0.8 },
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
      <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8 bg-background">
         <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CandlestickChart className="h-8 w-8 text-primary"/>
          Trading Center
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Trading Card */}
            <Card className="lg:col-span-3 bg-card/80 border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Quick Trade</CardTitle>
                    <CardDescription>Select an account to start trading.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Trade Ticket */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 border border-border/50 rounded-lg bg-black/20">
                        <div className="md:col-span-2">
                            <Label htmlFor="account-select">Account</Label>
                            <Select>
                                <SelectTrigger id="account-select"><SelectValue placeholder="Select Account..." /></SelectTrigger>
                                <SelectContent>
                                    {mockAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.label} ({acc.balance})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="symbol-input">Symbol</Label>
                            <Input id="symbol-input" placeholder="e.g., AAPL" />
                        </div>
                        <div>
                            <Label htmlFor="quantity-input">Quantity</Label>
                            <Input id="quantity-input" type="number" placeholder="0" />
                        </div>
                        <div>
                           <Label htmlFor="action-select">Action</Label>
                           <Select defaultValue="buy">
                             <SelectTrigger id="action-select">
                               <SelectValue/>
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="buy">Buy</SelectItem>
                               <SelectItem value="sell">Sell</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-2">
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
                             <Label htmlFor="duration-select">Duration</Label>
                             <Select defaultValue="day">
                               <SelectTrigger id="duration-select"><SelectValue/></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="day">Day</SelectItem>
                                 <SelectItem value="gtc">GTC</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                        </div>
                        <div className="md:col-span-7 flex justify-end gap-2 mt-2">
                            <Button variant="outline">Preview</Button>
                            <Button className="bg-primary hover:bg-primary/90">Submit</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                       {/* Positions */}
                        <div className="xl:col-span-2">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Positions</h3>
                            <div className="overflow-x-auto">
                               <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol/Name</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Market Value</TableHead>
                                        <TableHead className="text-right">Unrealized G/L</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPositions.map(pos => (
                                        <TableRow key={pos.symbol}>
                                            <TableCell>
                                                <div className="font-medium">{pos.symbol}</div>
                                                <div className="text-xs text-muted-foreground">{pos.name}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{pos.qty}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(pos.price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(pos.value)}</TableCell>
                                            <TableCell className={cn("text-right font-medium", pos.gainLoss > 0 ? 'text-green-400' : 'text-red-400')}>
                                                {formatCurrency(pos.gainLoss)} ({pos.gainLossPct.toFixed(1)}%)
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </div>
                        </div>

                        {/* Side Card for Orders & Market Movers */}
                        <div className="space-y-8">
                            {/* Orders */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-foreground">Open/Recent Orders</h3>
                                <div className="space-y-3">
                                   {mockOrders.map(order => (
                                       <div key={order.id} className="p-3 bg-black/30 border border-border/30 rounded-md">
                                           <div className="flex justify-between items-center">
                                               <span className="font-semibold text-foreground">{order.symbol}</span>
                                               {getStatusBadge(order.status)}
                                           </div>
                                           <div className="text-sm text-muted-foreground flex justify-between mt-1">
                                               <span>{order.action} {order.qty}</span>
                                               <span>{order.type}</span>
                                           </div>
                                            {order.status === 'Open' && <Button variant="link" size="sm" className="p-0 h-auto text-red-400 hover:text-red-500 mt-1">Cancel Order</Button>}
                                       </div>
                                   ))}
                                </div>
                            </div>
                            
                            {/* Market Movers/Watchlist */}
                            <div>
                                <Tabs defaultValue="movers">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="movers">Market Movers</TabsTrigger>
                                        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="movers" className="mt-4 space-y-2">
                                        {mockMarketMovers.map(mover => (
                                            <div key={mover.symbol} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/30">
                                               <div>
                                                 <p className="font-bold">{mover.symbol}</p>
                                                 <p className="text-xs text-muted-foreground truncate">{mover.name}</p>
                                               </div>
                                                <div className="text-right">
                                                    <p>{formatCurrency(mover.price)}</p>
                                                    <p className={cn("text-xs", mover.change > 0 ? 'text-green-400' : 'text-red-400')}>
                                                        {mover.change > 0 ? '+' : ''}{mover.change.toFixed(2)} ({mover.changePct.toFixed(1)}%)
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="watchlist" className="mt-4 space-y-2">
                                        {mockWatchlist.map(item => (
                                            <div key={item.symbol} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/30">
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
                                         <Button variant="outline" size="sm" className="w-full mt-2"><Plus className="mr-2 h-4 w-4"/>Add to Watchlist</Button>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}
