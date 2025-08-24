
// components/reports/ActionsRow.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { ActionPill } from "@/components/ui/ActionPill";
import MavenPill from "./maven/MavenPill";

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
  kbLoading: boolean;
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
  kbLoading,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const th = document.querySelector<HTMLElement>('.report-table thead th');
    const fs = th ? getComputedStyle(th).fontSize : null;
    if (fs && barRef.current) {
      barRef.current.style.setProperty('--pill-font-size', fs);
    }
  }, []);

  const isReady = filesReady && runState !== "running" && runState !== "success";
  const isRunning = runState === "running";
  const isSuccess = runState === "success";

  // Determine emphasis for "Run Report"
  let runLabelEmphasis: "normal" | "bright" | "active" = "normal";
  if (isReady) runLabelEmphasis = "bright";
  if (isSuccess) runLabelEmphasis = "active";

  // Determine emphasis for post-run actions
  const postRunLabelEmphasis = isSuccess ? "active" : "normal";

  return (
    <div ref={barRef} className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!isReady}
        isRunning={isRunning && !kbLoading} // Only show primary spinner if not indexing
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
        label="Dashboard"
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        icon={dashboardVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />
      <MavenPill onOpen={onAskMaven} />
    </div>
  );
}
