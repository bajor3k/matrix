// components/reports/ActionsRow.tsx
"use client";

import React from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";
import { Button } from "../ui/button";
import ReportDownloadModal from "./ReportDownloadModal";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "maven" | "key-metrics";

type Props = {
  filesReady: boolean;
  runState: RunState;
  activeView: ActiveView;
  onRun: (files?: { report1: File; report2: File; report3: File }) => void;
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

  const [open, setOpen] = React.useState(false);
  const [readyFiles, setReadyFiles] = React.useState<{ report1: File; report2: File; report3: File } | null>(null);

  const isReadyToRun = readyFiles && runState !== "running";
  const isSuccess = runState === "success";
  
  const noop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <Button
        variant="secondary"
        className="rounded-full h-9 bg-black border border-white/20 text-white font-semibold"
        onClick={() => setOpen(true)}
        aria-label="Download"
      >
        Download
      </Button>

      <Pill
        onClick={() => onRun(readyFiles ?? undefined)}
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
      <ReportDownloadModal
        open={open}
        onOpenChange={setOpen}
        labels={["Household Positions", "Account Activity", "Fee Schedule"]}
        onComplete={(f) => {
          setReadyFiles(f);
        }}
      />
    </>
  );
}
