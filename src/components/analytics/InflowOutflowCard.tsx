"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Point = { label: string; inflow: number; outflow: number };

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const short = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : fmt.format(n);

// --- MOCK DATA (replace with real series later) ---
const DATA_1M: Point[] = [
  { label: "03/01", inflow: 18000, outflow: 9000 },
  { label: "03/05", inflow: 22000, outflow: 8000 },
  { label: "03/09", inflow: 26000, outflow: 12000 },
  { label: "03/13", inflow: 30000, outflow: 14000 },
  { label: "03/17", inflow: 27000, outflow: 11000 },
  { label: "03/21", inflow: 32000, outflow: 15000 },
  { label: "03/25", inflow: 34000, outflow: 16000 },
  { label: "03/29", inflow: 36000, outflow: 17000 },
];

const DATA_QTD: Point[] = [
  { label: "Jan", inflow: 120000, outflow: 80000 },
  { label: "Feb", inflow: 150000, outflow: 90000 },
  { label: "Mar", inflow: 170000, outflow: 100000 },
];

const DATA_YTD: Point[] = [
  { label: "Jan", inflow: 120000, outflow: 80000 },
  { label: "Feb", inflow: 150000, outflow: 90000 },
  { label: "Mar", inflow: 170000, outflow: 100000 },
  { label: "Apr", inflow: 160000, outflow: 110000 },
  { label: "May", inflow: 175000, outflow: 120000 },
  { label: "Jun", inflow: 180000, outflow: 130000 },
];

function totals(rows: Point[]) {
  const totalIn = rows.reduce((s, r) => s + r.inflow, 0);
  const totalOut = rows.reduce((s, r) => s + r.outflow, 0);
  return { totalIn, totalOut, net: totalIn - totalOut };
}

export default function InflowOutflowCard() {
  const [range, setRange] = React.useState<"1M" | "QTD" | "YTD">("1M");

  const data = React.useMemo<Point[]>(() => {
    if (range === "QTD") return DATA_QTD;
    if (range === "YTD") return DATA_YTD;
    return DATA_1M;
  }, [range]);

  const t = totals(data);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Inflow v. Outflow</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as any)} className="w-auto">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="QTD">QTD</TabsTrigger>
            <TabsTrigger value="YTD">YTD</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={short as any} />
              <Tooltip formatter={(v: number) => fmt.format(v)} />
              <Legend />
              <Line type="monotone" dataKey="inflow" name="Inflows" stroke="#3DCCC7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="outflow" name="Outflows" stroke="#9C27B0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-transparent border border-white/10">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Total Inflows</div>
              <div className="text-lg font-semibold">{fmt.format(t.totalIn)}</div>
            </CardContent>
          </Card>
          <Card className="bg-transparent border border-white/10">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Net Flow</div>
              <div className={t.net >= 0 ? "text-green-500 text-lg font-semibold" : "text-red-500 text-lg font-semibold"}>
                {fmt.format(t.net)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-transparent border border-white/10">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Total Outflows</div>
              <div className="text-lg font-semibold">{fmt.format(t.totalOut)}</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
