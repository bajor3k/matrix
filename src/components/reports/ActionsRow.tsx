// components/reports/ActionsRow.tsx
"use client";

import * as React from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";
import { Button } from "../ui/button";
import TripleReportModal from "./TripleReportModal";
import type { TestReportFiles } from "@/utils/reports/test/runTestReport";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "maven" | "key-metrics";

type Props = {
  /** Your existing handler that kicks off the Python job */
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

  return (
    <>
      <div className={`report-actions flex items-center gap-2 ${className}`}>
        {/* Download FIRST (jet black + faint outline) */}
        <Button
          variant="secondary"
          className="rounded-full h-9 bg-black border border-white/20 text-white font-semibold"
          onClick={() => setOpen(true)}
        >
          Download
        </Button>

        <Button className="rounded-full h-9" disabled>
          Run Report
        </Button>

        <Button variant="secondary" className="rounded-full h-9" onClick={onExportExcel}>
          Excel
        </Button>
        <Button variant="secondary" className="rounded-full h-9" onClick={onOpenKeyMetrics}>
          Key Metrics
        </Button>
      </div>

      <TripleReportModal
        open={open}
        onOpenChange={setOpen}
        labels={["Household Positions", "Account Activity", "Fee Schedule"]}
        onComplete={async (files) => {
          try {
            setIsRunning(true);
            await onRun(files);                 // <-- TRIGGER PYTHON RUN HERE
          } finally {
            setIsRunning(false);
          }
        }}
      />
    </>
  );
}
