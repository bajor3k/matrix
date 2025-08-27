// components/reports/ActionsRow.tsx
"use client";

import React from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "maven" | "key-metrics";

type Props = {
  filesReady: boolean;
  runState: RunState;
  activeView: ActiveView;
  onRun: () => void;
  onDownloadExcel: () => void;
  onToggleKeyMetrics: () => void;
  onToggleMaven: () => void; // For collapsing the side panel
  kbLoading?: boolean;
  isMavenOpen: boolean;
  setIsMavenOpen: (open: boolean) => void;
  canOpenMaven: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  activeView,
  onRun,
  onDownloadExcel,
  onToggleKeyMetrics,
  onToggleMaven,
  kbLoading = false,
  isMavenOpen,
  setIsMavenOpen,
  canOpenMaven,
}: Props) {

  const isReadyToRun = filesReady && runState !== "running";
  const isSuccess = runState === "success";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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

      <Pill onClick={() => setIsMavenOpen(!isMavenOpen)} disabled={!canOpenMaven} active={isMavenOpen}>
        <Brain className="w-3.5 h-3.5" />
        Maven
        {isMavenOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </Pill>
    </div>
  );
}
