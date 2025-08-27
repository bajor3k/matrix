
"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

// Helper to safely parse string to number
const num = (v: any): number => {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/[, $]/g,''));
    return isFinite(n) ? n : 0;
  }

const KEYS_METRICS = [
  "#98CEF3", // Baby Blue Eyes
  "#B9E0FF", // Diamond
  "#D0E6FB", // Water
  "#E6D6FD", // Pale Lavender
  "#E4C5FB", // Pale Lavender (darker)
  "#D2ACFB", // Mauve
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
        <div className="report-card rounded-2xl lg:col-span-1 p-4">
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
                     <Cell fill={KEYS_METRICS[0]} />
                     <Cell fill={KEYS_METRICS[1]} />
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
        </div>

        {/* Bar Chart */}
        <div className="report-card rounded-2xl lg:col-span-1 p-4">
            <h3 className="text-sm text-slate-300 mb-3">Top 6 Accounts by Advisory Fee</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={metrics.topFees} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "#0f0f13", border: "1px solid #262636" }} />
                  <Bar dataKey="fee" radius={[6, 6, 0, 0]}>
                    {metrics.topFees.map((_, i) => (
                      <Cell key={i} fill={KEYS_METRICS[(i + 1) % KEYS_METRICS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {metrics.topFees.map((t, i) => (
                 <Badge key={t.name} className="border-none" style={{ backgroundColor: `${KEYS_METRICS[(i + 1) % KEYS_METRICS.length]}4D`, color: KEYS_METRICS[(i + 1) % KEYS_METRICS.length]}}>{t.name}: {formatCurrency(t.fee)}</Badge>
              ))}
            </div>
        </div>


        <div className="report-card rounded-2xl p-4">
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
                  <Line type="monotone" dataKey="ratio" stroke={KEYS_METRICS[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-slate-400">Avg ratio across buckets: <span className="text-slate-200">{avg(metrics.spark.map((s) => s.ratio)).toFixed(2)}%</span></p>
        </div>
      </div>


      <div className="report-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-slate-300">Accounts Flagged Short</h3>
            <Badge className="bg-rose-600/20 text-rose-300">{metrics.shortRows.length}</Badge>
          </div>
          {metrics.shortRows.length === 0 ? (
            <div className="text-slate-400 text-sm">No accounts are currently flagged as <span className="text-slate-200">Short</span>.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {metrics.shortRows.slice(0, 12).map((r, i) => (
                <div key={r.accountNumber} className="rounded-lg border border-white/10 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{r.ip}</p>
                      <p className="text-zinc-400 text-sm">{r.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-sm">Cash</p>
                      <p className="text-white font-bold">{r.cash}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}


function KpiCard({ title, value, subtitle, tone = "default" }: { title: string, value: string | number, subtitle: string, tone?: "default" | "alert" }) {
  return (
    <div className="report-card rounded-2xl p-5 flex items-start justify-between">
      <div>
        <p className="text-base font-semibold text-zinc-300">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      </div>

      <div className="text-right">
        <div className="text-4xl font-bold tracking-tight text-white">{value}</div>
      </div>
    </div>
  );
}


function formatCurrency(n: any) {
  return n?.toLocaleString?.("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) ?? "$0";
}


function avg(arr: any[]) {
  if (!arr?.length) return 0;
  return arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length;
}
