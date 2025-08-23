// src/components/reports/ReportsDashboard.tsx
"use client";

import KPIStackCard from "@/components/reports/KPIStackCard";
import InsightsChatCard from "@/components/reports/InsightsChatCard";
import type { TableRow } from "./ReportsDashboard.types";

type Props = {
  metrics: {
    totalAdvisoryFees: string;
    totalAccounts: number;
    flaggedShort: number;
  };
  tableRows: TableRow[];
  onAsk?: (q: string) => void;
};

export default function ReportsDashboard({
  metrics,
  tableRows,
  onAsk,
}: Props) {
  return (
    <div className="min-h-[60vh] bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-4">
            <KPIStackCard metrics={metrics} className="lg:col-span-1" />
            <InsightsChatCard onAsk={onAsk} className="lg:col-span-3" />
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
