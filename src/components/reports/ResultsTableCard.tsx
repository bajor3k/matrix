// components/reports/ResultsTableCard.tsx
import React from "react";
import type { TableRow } from "@/utils/csv";

export default function ResultsTableCard({ rows }: { rows: TableRow[] }) {
  return (
    <section
      className="
        w-full max-w-none               /* ← stretch */
        rounded-2xl border border-white/10
        bg-white dark:bg-[#101010]
        p-3 md:p-4
      "
      aria-label="Report rows"
    >
      <div className="overflow-auto max-h-[70vh] min-h-[220px]">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-white/10 sticky top-0 bg-[#101010]">
            <tr className="text-white/70">
              <th className="py-2.5 pr-4 pl-2 font-semibold">IP</th>
              <th className="py-2.5 pr-4 font-semibold">Account Number</th>
              <th className="py-2.5 pr-4 font-semibold">Value</th>
              <th className="py-2.5 pr-4 font-semibold">Advisory Fees</th>
              <th className="py-2.5 pr-4 font-semibold">Cash</th>
              <th className="py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/60">
                  No rows to display. Run the report to populate results.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-dashed border-white/5 last:border-0 hover:bg-white/5">
                  <td className="py-2 pr-4 pl-2 text-white/90">{r.ip}</td>
                  <td className="py-2 pr-4 text-white/90">{r.acct}</td>
                  <td className="py-2 pr-4 text-white">{r.value}</td>
                  <td className="py-2 pr-4 text-white">{r.fee}</td>
                  <td className="py-2 pr-4 text-white">{r.cash}</td>
                  <td className="py-2 text-white/90">
                    {r.short ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full border border-red-500 text-red-400 bg-red-500/10">
                            Short
                        </span>
                    ) : (
                        <span className="text-white/40">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
