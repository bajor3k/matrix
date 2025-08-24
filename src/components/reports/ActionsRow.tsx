// components/reports/ActionsRow.tsx
"use client";

import { Download as DownloadIcon, Brain } from "lucide-react";
import { ActionPill } from "@/components/ui/ActionPill";

type RunState = "idle" | "running" | "success" | "error";

type Props = {
  filesReady: boolean;
  runState: RunState;
  dashboardVisible: boolean;
  onRun: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
  onToggleDashboard: () => void;
  onAskMaven: () => void;
};

export default function ActionsRow({
  filesReady,
  runState,
  dashboardVisible,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
  onAskMaven,
}: Props) {
  
  const isReady = filesReady && runState !== 'running' && runState !== 'success';
  const isRunning = runState === 'running';
  const isSuccess = runState === 'success';

  // Determine emphasis for "Run Report"
  let runLabelEmphasis: "normal" | "bright" | "active" = "normal";
  if (isReady) runLabelEmphasis = "bright";
  if (isSuccess) runLabelEmphasis = "active";
  
  // Determine emphasis for post-run actions
  const postRunLabelEmphasis = isSuccess ? "active" : "normal";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!isReady}
        isRunning={isRunning}
        label="Run Report"
        srLabel="Run report"
        labelEmphasis={runLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={!isSuccess}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={!isSuccess}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={!isSuccess}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        labelEmphasis={postRunLabelEmphasis}
      />

      <ActionPill
        onClick={onAskMaven}
        disabled={!isSuccess}
        label="Maven"
        srLabel="Ask Maven"
        title="Ask Maven"
        icon={<Brain className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />
    </div>
  );
}
