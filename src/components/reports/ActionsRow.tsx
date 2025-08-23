// components/reports/ActionsRow.tsx
"use client";

import { Download as DownloadIcon } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import type { TableRow } from "@/utils/csv";
import { ActionPill } from "@/components/ui/ActionPill";

type Props = {
  uploadedFlags: boolean[];
  requiredCount?: number;
  hasResults: boolean;
  dashboardVisible: boolean;
  tableRows: TableRow[];
  onRun: () => void;
  onDownloadExcel: () => void;
  onToggleDashboard: () => void;
};

export default function ActionsRow({
  uploadedFlags,
  requiredCount = 3,
  hasResults,
  dashboardVisible,
  tableRows,
  onRun,
  onDownloadExcel,
  onToggleDashboard,
}: Props) {
  const canRun = uploadedFlags.slice(0, requiredCount).every(Boolean);
  const canDownload = hasResults;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!canRun}
        label="Run Report"
        srLabel="Run report"
        className="bg-[#08e28f] text-black hover:brightness-95 dark:text-black"
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={!canDownload}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
      />

      <ActionPill
        onClick={() => downloadCSV(tableRows)}
        disabled={!canDownload}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={!canDownload}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
      />
    </div>
  );
}
