
// components/reports/ActionsRow.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "none" | "dashboard" | "key-metrics";

type Props = {
  filesReady: boolean;
  runState: RunState;
  activeView: ActiveView;
  onRun: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
  onToggleDashboard: () => void;
  onToggleKeyMetrics: () => void;
  onAskMaven: () => void;
  kbLoading?: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  activeView,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
  onToggleKeyMetrics,
  onAskMaven,
  kbLoading = false,
}: Props) {

  const isReadyToRun = filesReady && runState !== "running";
  const isSuccess = runState === "success";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <Pill
        onClick={onRun}
        disabled={!isReadyToRun || (runState === 'running' && !kbLoading)}
        active={isReadyToRun}
      >
        {runState === 'running' && !kbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : null}
        Run Report
      </Pill>

      <Pill disabled={!isSuccess} onClick={onDownloadExcel}>
        <DownloadIcon className="w-3.5 h-3.5" />
        Excel
      </Pill>

      <Pill disabled={!isSuccess} onClick={onDownloadCsv}>
        <DownloadIcon className="w-3.5 h-3.5" />
        CSV
      </Pill>

      <Pill disabled={!isSuccess} onClick={onToggleDashboard} active={activeView === 'dashboard'}>
        Dashboard
        {activeView === 'dashboard' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </Pill>
      
      <Pill disabled={!isSuccess} onClick={onToggleKeyMetrics} active={activeView === 'key-metrics'}>
        Key Metrics
      </Pill>

      <MavenPill onOpen={onAskMaven} isLoading={kbLoading} disabled={!isSuccess} />
    </div>
  );
}
