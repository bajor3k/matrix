
"use client";

import * as React from 'react';
import MarketCard from "@/components/MarketCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Welcome Josh!
      </h1>

      <section>
        <h2 className="sr-only">Market Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MarketCard label="Apple (AAPL)"     price={227.76} changePct={0.70} />
          <MarketCard label="Microsoft (MSFT)" price={507.23} changePct={0.59} />
          <MarketCard label="S&P 500 (SPY)"    isLoading />
          <MarketCard label="Dow Jones (DIA)"  isLoading />
          <div className="lg:col-span-2">
             <RecentActivity />
          </div>
        </div>
      </section>
    </main>
  );
}
