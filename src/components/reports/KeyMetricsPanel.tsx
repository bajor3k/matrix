
"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Users, AlertTriangle, Sparkles } from "lucide-react";

// Helper to safely parse string to number
const num = (v: any): number => {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/[, $]/g,''));
    return isFinite(n) ? n : 0;
  }

const KEYS_TEAL = [
  "#0EA792", // Persian Green
  "#29B48B", // Jungle Green
  "#3DC08C", // Ocean Green
  "#5FD797", // Medium Aquamarine
  "#5CE4BE", // Medium Aquamarine (lighter)
  "#4DFBF2", // Turquoise
] as const;
  
// Main Component
export default function KeyMetricsPanel({ rows }: { rows: any[] }) {
  const metrics = useMemo(() => {
    const totalFees = rows.reduce((acc, r) => acc + num(r.fee), 0);
    const shortRows = rows.filter(r => r.short);
    const clearRows = rows.filter(r => !r.short);
    
    // Sort by fee and get top 6 for bar chart
    const topFees = [...rows]
      .sort((a, b) => num(b.fee) - num(a.fee))
      .slice(0, 6)
      .map(r => ({ name: r.acct, fee: num(r.fee) }));
      
    // Sparkline data - cash/value ratio in buckets
    const sparkData = [];
    const bucketSize = Math.ceil(rows.length / 7);
    if (bucketSize > 0) {
        for (let i = 0; i < rows.length; i += bucketSize) {
            const bucket = rows.slice(i, i + bucketSize);
            const totalCash = bucket.reduce((s, r) => s + num(r.cash), 0);
            const totalValue = bucket.reduce((s, r) => s + num(r.value), 0);
            sparkData.push({ idx: i, ratio: totalValue > 0 ? (totalCash / totalValue) * 100 : 0 });
        }
    }

    return {
      totalFees,
      totalAccounts: rows.length,
      flaggedShort: shortRows.length,
      donutData: [
        { name: "Short", value: shortRows.length },
        { name: "Clear", value: clearRows.length },
      ],
      topFees,
      spark: sparkData,
      shortRows: shortRows.map(r => ({
          accountNumber: r.acct,
          ip: r.ip,
          cash: r.cash,
      }))
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Advisory Fees"
          value={formatCurrency(metrics.totalFees)}
          subtitle="Sum of all fees from report"
        />
        <KpiCard
          title="Accounts"
          value={metrics.totalAccounts}
          subtitle="Total accounts in the report"
        />
        <KpiCard
          title="Flagged Short"
          value={metrics.flaggedShort}
          subtitle="Accounts with cash < fees"
          tone="alert"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut Chart */}
        <Card className="lg:col-span-1 bg-black border-slate-800">
          <CardContent className="p-4">
            <h3 className="text-sm text-center text-slate-300 mb-2">Short vs. Clear Accounts</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip contentStyle={{ background: "#0f0f13", border: "1px solid #262636" }} />
                  <Pie
                    data={metrics.donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    dataKey="value"
                    stroke="none"
                  >
                     <Cell fill={KEYS_TEAL[0]} />
                     <Cell fill={KEYS_TEAL[1]} />
                  </Pie>
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-bold">
                    {formatCurrency(metrics.totalFees)}
                  </text>
                  <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-xs">
                    {metrics.flaggedShort} short · {metrics.totalAccounts - metrics.flaggedShort} clear
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-1 bg-black border-slate-800">
          <CardContent className="p-4">
            <h3 className="text-sm text-slate-300 mb-3">Top 6 Accounts by Advisory Fee</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={metrics.topFees} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "#0f0f13", border: "1px solid #262636" }} />
                  <Bar dataKey="fee" radius={[6, 6, 0, 0]}>
                    {metrics.topFees.map((_, i) => (
                      <Cell key={i} fill={KEYS_TEAL[i % KEYS_TEAL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {metrics.topFees.map((t, i) => (
                <Badge key={t.name} style={{ backgroundColor: `${KEYS_TEAL[i % KEYS_TEAL.length]}4D`, color: KEYS_TEAL[i % KEYS_TEAL.length]}} className="border-none">{t.name}: {formatCurrency(t.fee)}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card className="bg-black border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-slate-300">Cash / Value Ratio (sparkline)</h3>
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={metrics.spark}>
                  <XAxis dataKey="idx" hide />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} contentStyle={{ background: "#0f0f13", border: "1px solid #262636" }} />
                  <Line type="monotone" dataKey="ratio" stroke={KEYS_TEAL[5]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-slate-400">Avg ratio across buckets: <span className="text-slate-200">{avg(metrics.spark.map((s) => s.ratio)).toFixed(2)}%</span></p>
          </CardContent>
        </Card>
      </div>


      <Card className="bg-black border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-slate-300">Accounts Flagged Short</h3>
            <Badge className="bg-rose-600/20 text-rose-300">{metrics.shortRows.length}</Badge>
          </div>
          {metrics.shortRows.length === 0 ? (
            <div className="text-slate-400 text-sm">No accounts are currently flagged as <span className="text-slate-200">Short</span>.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {metrics.shortRows.slice(0, 12).map((r, i) => (
                <div
                  key={r.accountNumber}
                  className="rounded-lg border border-white/10 bg-transparent p-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-slate-300 text-xs">{r.ip}</div>
                      <div className="text-slate-100 text-sm font-medium">{r.accountNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[11px]">Cash</div>
                      <div className="text-slate-100 text-sm">{formatCurrency(Number(r.cash) || 0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function KpiCard({ title, value, subtitle, tone = "default", color }: { title: string, value: string | number, subtitle: string, tone?: "default" | "alert", color?: string }) {
  return (
    <Card className="relative overflow-hidden border-slate-800 bg-black">
      <CardContent className="p-4 relative">
        <div className="flex items-center gap-2 text-slate-300 text-xs mb-1">
          <span>{title}</span>
        </div>
        <div className="text-2xl font-semibold text-white">{value}</div>
        {subtitle && <div className="text-[11px] text-slate-500 mt-1">{subtitle}</div>}
        {color && <div className="absolute right-2 top-2 w-2 h-2 rounded-full" style={{backgroundColor: color}} />}
      </CardContent>
    </Card>
  );
}


function formatCurrency(n: any) {
  return n?.toLocaleString?.("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) ?? "$0";
}


function avg(arr: any[]) {
  if (!arr?.length) return 0;
  return arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length;
}
