// components/reports/ActionsRow.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TestReportFiles } from "@/utils/reports/test/runTestReport";
import ReportDownloadModal from "./ReportDownloadModal";

type PillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function Pill({ label, active = false, onClick }: PillProps) {
  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      className={cn(
        "px-5 py-2 rounded-full border transition-colors h-9",
        "border-white/10 bg-black",
        active
          ? "text-white/80 hover:text-white"
          : "text-white/40 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}


type Props = {
  onRun: (files: TestReportFiles) => Promise<void> | void;
  onExportExcel?: () => void;
  onOpenKeyMetrics?: () => void;
  className?: string;
};

export default function ActionsRow({
  onRun,
  onExportExcel,
  onOpenKeyMetrics,
  className = "",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<TestReportFiles | null>(null);

  const canRun = !!selectedFiles;

  const handleRunClick = async () => {
    if (!selectedFiles) return;
    try {
        setIsRunning(true);
        await onRun(selectedFiles);
    } finally {
        setIsRunning(false);
    }
  }


  return (
    <>
      <div className={`report-actions flex items-center justify-center gap-3 ${className}`}>
         <Pill label="Download" active onClick={() => setOpen(true)} />
         <Pill label="Run Report" active={canRun && !isRunning} onClick={handleRunClick} />
         <Pill label="Excel" />
         <Pill label="Key Metrics" />
      </div>

      <ReportDownloadModal
        open={open}
        onOpenChange={setOpen}
        onComplete={(files) => {
            setSelectedFiles(files)
            setOpen(false);
        }}
      />
    </>
  );
}
