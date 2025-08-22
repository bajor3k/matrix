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
    <div className="min-h-[60vh] bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* KPIs + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:col-span-2">
            {kpis?.map((k, i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-5">
                <div className="text-xs text-white/60">{k.label}</div>
                <div className="mt-1 text-xl font-semibold text-white/90">{k.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <div className="text-sm text-white/80">{donutTitle}</div>
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
                    stroke="rgba(0,0,0,0.4)"
                  >
                    {donutData?.map((_, idx) => (
                      <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0b0b0b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "white",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="[&>th]:text-left [&>th]:text-xs [&>th]:font-semibold [&>th]:text-white/60 [&>th]:py-2.5 [&>th]:px-2.5 border-b border-white/10">
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
                    className="border-b border-dashed border-white/10 even:bg-white/5"
                  >
                    <td className="py-2.5 px-2.5 text-sm text-white/90">{r.ip}</td>
                    <td className="py-2.5 px-2.5 text-sm text-white/90 whitespace-nowrap">{r.acct}</td>
                    <td className="py-2.5 px-2.5 text-sm text-white/90">{r.value}</td>
                    <td className="py-2.5 px-2.5 text-sm text-white/90">{r.fee}</td>
                    <td className="py-2.5 px-2.5 text-sm text-white/90">{r.cash}</td>
                    <td className="py-2.5 px-2.5 text-sm">
                      {r.short ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ color: "#e31211", border: "1px solid #e31211" }}>
                          Short
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!tableRows?.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/50 text-sm">
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
