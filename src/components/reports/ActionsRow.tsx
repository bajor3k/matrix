// components/reports/ActionsRow.tsx
"use client";

import { Download as DownloadIcon, Brain } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import type { TableRow } from "@/utils/csv";
import { ActionPill } from "@/components/ui/ActionPill";

type Props = {
  filesReady: boolean;
  reportStatus: "idle" | "running" | "success" | "error";
  dashboardVisible: boolean;
  onRun: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
  onToggleDashboard: () => void;
};

export default function ActionsRow({
  filesReady,
  reportStatus,
  dashboardVisible,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
}: Props) {
  const canRun = filesReady && reportStatus !== "running";
  const ranSuccess = reportStatus === "success";
  const downloadsOn = ranSuccess;
  const dashOn = ranSuccess;
  const mavenOn = ranSuccess;

  const runVariant = canRun || ranSuccess ? "primary" : "default";
  const postVariant = ranSuccess ? "primary" : "default";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!canRun}
        label="Run Report"
        srLabel="Run report"
        variant={runVariant}
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={!downloadsOn}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postVariant}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={!downloadsOn}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postVariant}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={!dashOn}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        variant={postVariant}
      />

      {/* NEW: Maven (non-functional for now) */}
      <ActionPill
        // onClick={...}  // wire later
        disabled={!mavenOn}
        label="Maven"
        srLabel="Ask Maven"
        title="Ask Maven"
        icon={<Brain className="w-4 h-4" />}
        variant={postVariant}
      />
    </div>
  );
}
