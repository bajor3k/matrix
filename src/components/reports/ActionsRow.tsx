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
};

export default function ActionsRow({
  filesReady,
  runState,
  dashboardVisible,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
}: Props) {
  // STATE 1: < 3 uploads -> everything neutral/muted/disabled
  // STATE 2: 3 uploads, not run -> Run=green enabled; others neutral/muted/disabled
  // STATE 3: run success -> Run=green; others enabled + bright label (pill stays neutral)

  const runVariant        = filesReady ? "primary" : "neutral";
  const runLabelEmphasis  = filesReady ? "bright" : "normal";
  const runDisabled       = !filesReady || runState === "running";

  const afterRunSuccess   = runState === "success";

  const postVariant       = "neutral" as const;
  const postLabelEmphasis = afterRunSuccess ? "bright" : "normal";
  const postDisabled      = !afterRunSuccess; // enable ONLY after a successful run
  
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

      <ActionPill
        // onClick={() => {}} // wire later
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
