// components/reports/KPIStackCard.tsx
import React from "react";
import { DollarSign, Users, AlertTriangle } from "lucide-react";

type Metrics = {
  totalAdvisoryFees: string; // already formatted “$2,123.00”
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
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between rounded-xl border border-white/10 px-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );

  return (
    <section
      className={[
        "rounded-2xl border border-white/10 p-4 md:p-5",
        "bg-white dark:bg-[#101010]",
        className || "",
      ].join(" ")}
    >
      <h3 className="report-heading mb-3 text-white/85">Key Metrics</h3>

      <div className="space-y-3">
        <Row
          icon={<DollarSign className="w-4 h-4 text-white/60" />}
          label="Total Advisory Fees"
          value={<span>{metrics.totalAdvisoryFees}</span>}
        />
        <Row
          icon={<Users className="w-4 h-4 text-white/60" />}
          label="Total Accounts"
          value={<span>{metrics.totalAccounts}</span>}
        />
        <Row
          icon={<AlertTriangle className="w-4 h-4 text-white/60" />}
          label="Flagged Short"
          value={<span>{metrics.flaggedShort}</span>}
        />
      </div>
    </section>
  );
}
