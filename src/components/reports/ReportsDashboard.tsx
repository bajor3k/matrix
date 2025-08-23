// src/components/reports/ReportsDashboard.tsx
import { KpiRow } from "@/components/reports/KpiRow";

type Props = {
  metrics: {
    totalAdvisoryFees: number;
    totalAccounts: number;
    flaggedShort: number;
    totalRows: number;
  };
};

export default function ReportsDashboard({
  metrics,
}: Props) {
  return (
    <div
      className="
        w-full max-w-none
        grid gap-4 md:gap-6 items-stretch
        grid-cols-1
      "
    >
      <KpiRow
        totalAdvisoryFees={metrics.totalAdvisoryFees}
        totalAccounts={metrics.totalAccounts}
        flaggedShort={metrics.flaggedShort}
        totalRows={metrics.totalRows}
      />
    </div>
  );
}
