// components/reports/KPIStackCard.tsx
import React from "react";

type Metrics = {
  totalAdvisoryFees: string; // e.g. "$2,123.00" (already formatted)
  totalAccounts: number;
  flaggedShort: number;
};

export default function KPIStackCard({
  metrics,
  className,
}: {
  metrics: Metrics;
  className?: string;
}) {
  const Row = ({ label, value, emphasize = false }: { label: string; value: React.ReactNode; emphasize?: boolean }) => (
    <div className="flex items-baseline justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm md:text-[0.95rem] text-black/70 dark:text-white/75">{label}</span>
      <span
        className={[
          emphasize ? "text-2xl md:text-3xl font-extrabold" : "text-xl md:text-2xl font-bold",
          "text-black dark:text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );

  return (
    <section
      className={[
        "h-full rounded-2xl border",
        "border-black/10 dark:border-white/10",
        "bg-white dark:bg-[#101010]",
        "p-4 md:p-5",
        className || "",
      ].join(" ")}
      aria-label="Report KPIs"
    >
      {/* three clean rows, separated by subtle dividers */}
      <div className="divide-y divide-black/10 dark:divide-white/10">
        <Row label="Total Advisory Fees" value={metrics.totalAdvisoryFees} emphasize />
        <Row label="Total Accounts" value={metrics.totalAccounts} />
        <Row label="Flagged Short" value={metrics.flaggedShort} />
      </div>
    </section>
  );
}
