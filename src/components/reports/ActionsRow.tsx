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
  // BEFORE uploads: all neutral + muted
  // AFTER uploads:
  //   - Run Report => green + enabled
  //   - Excel/CSV/Dashboard/Maven => neutral, brighter label + enabled

  const runVariant        = filesReady ? "primary" : "neutral";
  const runLabelEmphasis  = filesReady ? "bright" : "normal";  // <— FIX: no bright before uploads
  const runDisabled       = !filesReady;

  const postVariant       = "neutral" as const;
  const postLabelEmphasis = filesReady ? "bright" : "normal";
  const postDisabled      = !filesReady;


  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={runDisabled}
        label="Run Report"
        srLabel="Run report"
        variant={runVariant}
        labelEmphasis={runLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={postDisabled}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postVariant}
        labelEmphasis={postLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={postDisabled}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
        variant={postVariant}
        labelEmphasis={postLabelEmphasis}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={postDisabled}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        variant={postVariant}
        labelEmphasis={postLabelEmphasis}
      />

      {/* AskMaven — not functional yet, but lights up exactly like the others */}
      <ActionPill
        // onClick={() => {}} // hook up later
        disabled={postDisabled}
        label="Maven"
        srLabel="Maven"
        title="Maven"
        icon={<Brain className="w-4 h-4" />}
        variant={postVariant}
        labelEmphasis={postLabelEmphasis}
      />
    </div>
  );
}
