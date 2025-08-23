// src/components/reports/ReportsDashboard.tsx
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
    <div
      className="
        w-full max-w-none               /* ← stretch */
        grid gap-4 md:gap-6 items-stretch
        grid-cols-1 lg:grid-cols-12
      "
    >
      <KPIStackCard metrics={metrics} className="lg:col-span-3 h-full" />
      <InsightsChatCard onAsk={onAsk} className="lg:col-span-9 h-full" />
    </div>
  );
}
