// src/components/reports/ReportsDashboard.tsx
"use client";

import KPIStackCard from "@/components/reports/KPIStackCard";
import InsightsChatCard from "@/components/reports/InsightsChatCard";

type Props = {
  metrics: {
    totalAdvisoryFees: string;
    totalAccounts: number;
    flaggedShort: number;
  };
  onAsk?: (q: string) => void;
};

export default function ReportsDashboard({
  metrics,
  onAsk,
}: Props) {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-4 items-stretch">
      <KPIStackCard metrics={metrics} className="lg:col-span-1" />
      <InsightsChatCard onAsk={onAsk} className="lg:col-span-3 h-full" />
    </div>
  );
}
