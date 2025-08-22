// src/components/reports/ReportsDashboard.tsx
"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { ReportsDashboardProps } from "./ReportsDashboard.types";

const PALETTE = [
  "#08e28f", "#19c07a", "#24a56c", "#2f8b5f",
  "#3a7051", "#455643", "#596b60", "#6a7c72",
];

export default function ReportsDashboard({
  kpis,
  donutTitle = "Advisory Fees by IP",
  donutData,
  tableRows,
}: ReportsDashboardProps) {
  return (
    <div className="min-h-[60vh] bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* KPIs + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:col-span-2">
            {kpis?.map((k, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/50 p-5 dark:bg-transparent">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="mt-1 text-xl font-semibold text-foreground/90">{k.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5 dark:bg-transparent">
            <div className="text-sm text-foreground/80">{donutTitle}</div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke="var(--card)"
                  >
                    {donutData?.map((_, idx) => (
                      <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                    wrapperClassName="recharts-default-tooltip"
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card/50 p-5 dark:bg-transparent">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="[&>th]:text-left [&>th]:text-xs [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:py-2.5 [&>th]:px-2.5 border-b border-border">
                  <th>IP</th>
                  <th>Account Number</th>
                  <th>Value</th>
                  <th>Advisory Fees</th>
                  <th>Cash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows?.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-dashed border-border last:border-b-0 even:bg-muted/30 dark:even:bg-white/5"
                  >
                    <td className="py-2.5 px-2.5 text-sm text-foreground/90">{r.ip}</td>
                    <td className="py-2.5 px-2.5 text-sm text-foreground/90 whitespace-nowrap">{r.acct}</td>
                    <td className="py-2.5 px-2.5 text-sm text-foreground/90">{r.value}</td>
                    <td className="py-2.5 px-2.5 text-sm text-foreground/90">{r.fee}</td>
                    <td className="py-2.5 px-2.5 text-sm text-foreground/90">{r.cash}</td>
                    <td className="py-2.5 px-2.5 text-sm">
                      {r.short ? (
                        <span className="pill-short">
                          Short
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!tableRows?.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                      No rows to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
