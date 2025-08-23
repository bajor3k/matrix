
import React from "react";

export type TableRow = {
  ip: string;
  acct: string;
  value: string;
  fee: string;
  cash: string;
  short: boolean;
};

export default function ResultsTableCard({ rows }: { rows: TableRow[] }) {
  return (
    <section
      className="
        w-full max-w-none
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
                  <td className="py-2 text-black dark:text-white">
                    {r.short ? (
                      <span className="inline-flex items-center rounded-full px-2 py-[2px] text-xs
                                       bg-[#2a0000] text-[#e31211] dark:bg-[#2a0000]">
                        Short
                      </span>
                    ) : (
                      "—"
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
