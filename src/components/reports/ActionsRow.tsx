// components/reports/ActionsRow.tsx
"use client";

import { Download as DownloadIcon, Brain } from "lucide-react";
import { ActionPill } from "@/components/ui/ActionPill";

type Props = {
  filesReady: boolean;
  dashboardVisible: boolean;
  onRun: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
  onToggleDashboard: () => void;
};

export default function ActionsRow({
  filesReady,
  dashboardVisible,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
}: Props) {
  // BEFORE uploads:
  //   - All neutral pills; labels "normal" (muted)
  // AFTER uploads:
  //   - Run Report => primary (green) + enabled
  //   - Excel/CSV/Dashboard/Maven => neutral but label "bright" + enabled

  const runVariant        = filesReady ? "primary" : "neutral";
  const runDisabled       = !filesReady;

  const postPillDisabled  = !filesReady;              // enabled after uploads
  const postPillVariant   = "neutral" as const;       // stays neutral even after uploads
  const postPillEmphasis  = filesReady ? "bright" : "normal";


  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={runDisabled}
        label="Run Report"
        srLabel="Run report"
        variant={runVariant}
        labelEmphasis="bright"
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={postPillDisabled}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postPillVariant}
        labelEmphasis={postPillEmphasis}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={postPillDisabled}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postPillVariant}
        labelEmphasis={postPillEmphasis}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={postPillDisabled}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        variant={postPillVariant}
        labelEmphasis={postPillEmphasis}
      />

      {/* NEW: AskMaven (non-functional for now) */}
      <ActionPill
        // onClick={...}  // wire later
        disabled={postPillDisabled}
        label="Maven"
        srLabel="Maven"
        title="Maven"
        icon={<Brain className="w-4 h-4" />}
        variant={postPillVariant}
        labelEmphasis={postPillEmphasis}
      />
    </div>
  );
}