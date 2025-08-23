// components/reports/KPIStackCard.tsx
import React from "react";

type Metrics = {
  totalAdvisoryFees: string; // formatted e.g., "$2,123.00"
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
  const Row = ({
    label,
    value,
    emphasize = false,
  }: {
    label: string;
    value: React.ReactNode;
    emphasize?: boolean;
  }) => (
    <div
      className="
        grid grid-cols-[1fr_auto] items-center
        py-3 first:pt-2 last:pb-2
      "
    >
      <span className="text-[0.95rem] md:text-base text-black/70 dark:text-white/75 leading-snug">
        {label}
      </span>
      <span
        className={[
          emphasize
            ? "text-3xl md:text-4xl font-extrabold"
            : "text-2xl md:text-3xl font-bold",
          "text-black dark:text-white leading-none tabular-nums tracking-tight",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );

  return (
    <section
      aria-label="Report KPIs"
      className={[
        "h-full rounded-2xl border",
        "border-black/10 dark:border-white/10",
        "bg-white dark:bg-[#101010]",
        "p-4 md:p-5",
        className || "",
      ].join(" ")}
    >
      <div className="divide-y divide-black/10 dark:divide-white/10">
        <Row label="Total Advisory Fees" value={metrics.totalAdvisoryFees} emphasize />
        <Row label="Total Accounts" value={metrics.totalAccounts} />
        <Row label="Flagged Short" value={metrics.flaggedShort} />
      </div>
    </section>
  );
}
