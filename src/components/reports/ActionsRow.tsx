// components/reports/ActionsRow.tsx
"use client";

import React from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";
import UploadBrowse from "./UploadBrowse";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "maven" | "key-metrics";

type Props = {
  filesReady: boolean;
  runState: RunState;
  activeView: ActiveView;
  onRun: () => void;
  onDownloadExcel: () => void;
  onToggleKeyMetrics: () => void;
  kbLoading?: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  activeView,
  onRun,
  onDownloadExcel,
  onToggleKeyMetrics,
  kbLoading = false,
}: Props) {

  const isReadyToRun = filesReady && runState !== "running";
  const isSuccess = runState === "success";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <UploadBrowse
        accept=".xlsx,.csv"
        multiple={false}
        onFilesSelected={(files) => {
          // plug your logic later
          // e.g., toast(`Selected ${files[0].name}`)
        }}
      />
      <Pill
        onClick={onRun}
        disabled={!isReadyToRun || (runState === 'running' && !kbLoading)}
      >
        {runState === 'running' && !kbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : null}
        Run Report
      </Pill>

      <Pill disabled={!isSuccess} onClick={onDownloadExcel}>
        <DownloadIcon className="h-3.5 w-3.5" />
        Excel
      </Pill>
      
      <Pill disabled={!isSuccess} onClick={onToggleKeyMetrics} active={activeView === 'key-metrics'}>
        Key Metrics
      </Pill>
    </div>
  );
}
