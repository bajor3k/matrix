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

      <div className="grid grid-cols-12 gap-4">

        {/* Top row: four stock cards, 3 columns each */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MarketCard label="Apple (AAPL)" price={227.76} changePct={0.70} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MarketCard label="Microsoft (MSFT)" price={507.23} changePct={0.59} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MarketCard label="S&P 500 (SPY)" isLoading />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MarketCard label="Dow Jones (DIA)" isLoading />
        </div>

        {/* Recent Activity: move to the RIGHT half (same width as two cards) */}
        <div className="col-span-12 xl:col-span-6 xl:col-start-7">
          <RecentActivity />
        </div>

      </div>
    </main>
  );
}
