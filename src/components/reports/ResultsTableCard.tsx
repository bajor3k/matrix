// components/reports/ResultsTableCard.tsx
import React from "react";

export type TableRow = {
  ip: string;
  acct: string;
  value: string;
  fee: string;
  cash: string;
  short: boolean;
};

function StatusPill({ short }: { short: boolean }) {
  if (!short) return <>—</>;
  return (
    <span
      className="
        inline-flex items-center rounded-full px-2 py-[2px] text-xs font-medium
        text-[#e31211]
        bg-[#ffe9e9] dark:bg-[#2a0000]
        border border-[#e31211]/20 dark:border-[#e31211]/25
      "
    >
      Short
    </span>
  );
}

export default function ResultsTableCard({ rows }: { rows: TableRow[] }) {
  return (
    <section
      className="
        w-full max-w-none rounded-2xl border
        bg-white dark:bg-[#101010]
        border-[#e5e7eb] dark:border-white/10
        p-3 md:p-4
        flex flex-col h-full
      "
      aria-label="Report rows"
    >
      <div className="overflow-auto flex-grow">
        <table className="w-full text-sm">
          {/* Header — light in light-mode, dark in dark-mode */}
          <thead
            className="
              sticky top-0 z-10
              bg-[#fcfbfb] dark:bg-[#0b0b0b]
              text-black/80 dark:text-white/70
              border-b border-[#e5e7eb] dark:border-white/10
            "
          >
            <tr>
              <th className="py-2.5 pr-4 pl-2 text-left font-semibold">IP</th>
              <th className="py-2.5 pr-4 text-left font-semibold">Account Number</th>
              <th className="py-2.5 pr-4 text-left font-semibold">Value</th>
              <th className="py-2.5 pr-4 text-left font-semibold">Advisory Fees</th>
              <th className="py-2.5 pr-4 text-left font-semibold">Cash</th>
              <th className="py-2.5 text-left font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-black/60 dark:text-white/60">
                  No rows to display. Run the report to populate results.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={i}
                  className="
                    /* zebra striping */
                    odd:bg-[#fcfbfb] even:bg-[#f3f3f3]
                    dark:odd:bg-[#0b0b0b] dark:even:bg-[#141414]

                    /* borders + hover */
                    border-b border-black/10 dark:border-white/5 last:border-0
                    hover:bg-black/[.04] dark:hover:bg-white/5
                  "
                >
                  <td className="py-2 pr-4 pl-2 text-black dark:text-white">{r.ip}</td>
                  <td className="py-2 pr-4 text-black dark:text-white">{r.acct}</td>
                  <td className="py-2 pr-4 text-black dark:text-white">{r.value}</td>
                  <td className="py-2 pr-4 text-black dark:text-white">{r.fee}</td>
                  <td className="py-2 pr-4 text-black dark:text-white">{r.cash}</td>

                  {/* Status column — NO black cell background; just zebra row background */}
                  <td className="py-2 text-black dark:text-white">
                    <StatusPill short={r.short} />
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
