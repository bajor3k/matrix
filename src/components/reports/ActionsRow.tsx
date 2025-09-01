// components/reports/ActionsRow.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TestReportFiles } from "@/utils/reports/test/runTestReport";
import ReportDownloadModal from "./ReportDownloadModal";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "none" | "dashboard" | "key-metrics" | "maven";

type Props = {
  filesReady: boolean;
  runState: RunState;
  onRun: () => void;
  onDownloadExcel?: () => void;
  onToggleKeyMetrics?: () => void;
  onToggleMaven?: () => void;
  isMavenOpen?: boolean;
  canOpenMaven?: boolean;
  className?: string;
};

export default function ActionsRow({
  filesReady,
  runState,
  onRun,
  onDownloadExcel,
  onToggleKeyMetrics,
  onToggleMaven,
  isMavenOpen = false,
  canOpenMaven = false,
  className = "",
}: Props) {
    const [modalOpen, setModalOpen] = React.useState(false);
    
  return (
    <>
      <div className={`report-actions flex items-center justify-center gap-3 ${className}`}>
         <Button
          className="rounded-full h-9"
          onClick={onRun}
          disabled={!filesReady || runState === 'running'}
        >
          {runState === 'running' ? <Loader2 className="animate-spin" /> : 'Run Report'}
        </Button>
         <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={onDownloadExcel}
          disabled={runState !== 'success' && !filesReady}
        >
          Excel
        </Button>
         <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={onToggleKeyMetrics}
          disabled={runState !== 'success'}
        >
           Key Metrics
        </Button>
        <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={onToggleMaven}
          disabled={!canOpenMaven}
        >
           {isMavenOpen ? 'Hide Maven' : 'Ask Maven'}
        </Button>
      </div>

      <ReportDownloadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onComplete={(files: any) => {
            // This component no longer handles file state directly.
            // The parent `ReportScaffold` will get files from its own `UploadSlot`s.
            console.log("Modal complete, files ready for parent:", files);
        }}
      />
    </>
  );
}