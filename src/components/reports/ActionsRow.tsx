// components/reports/ActionsRow.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
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
  kbLoading?: boolean;
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
  kbLoading = false,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const th = document.querySelector<HTMLElement>('.report-table thead th');
    const fs = th ? getComputedStyle(th).fontSize : null;
    if (fs && barRef.current) {
      barRef.current.style.setProperty('--pill-font-size', fs);
    }
  }, []);

  const isReadyToRun = filesReady && runState !== "running";
  const isSuccess = runState === "success";

  return (
    <div ref={barRef} className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!isReadyToRun}
        isRunning={runState === 'running' && !kbLoading}
        label="Run Report"
        srLabel="Run report"
        labelEmphasis={isReadyToRun ? "bright" : "normal"}
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={!isSuccess}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-3.5 h-3.5" />}
        labelEmphasis={isSuccess ? "active" : "normal"}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={!isSuccess}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-3.5 h-3.5" />}
        labelEmphasis={isSuccess ? "active" : "normal"}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={!isSuccess}
        label="Dashboard"
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        icon={dashboardVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        labelEmphasis={isSuccess ? "active" : "normal"}
      />
      
      <ActionPill
        onClick={onToggleDashboard}
        disabled={!isSuccess}
        label="Key Metrics"
        srLabel="Toggle key metrics"
        icon={<BarChartHorizontal className="w-3.5 h-3.5" />}
        labelEmphasis={isSuccess ? "active" : "normal"}
      />

      <MavenPill onOpen={onAskMaven} isLoading={kbLoading} disabled={!isSuccess} />
    </div>
  );
}
