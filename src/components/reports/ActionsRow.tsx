// components/reports/ActionsRow.tsx
"use client";

import * as React from "react";
import ReportDownloadModal from "./ReportDownloadModal";
import ReportButtons from "./ReportButtons";

type RunState = "idle" | "running" | "success" | "error";

type Props = {
  filesReady: boolean;
  runState: RunState;
  onRun: () => void;
  onExcel?: () => void;
  excelEnabled?: boolean;
  onToggleKeyMetrics?: () => void;
  onModalComplete: (files: File[]) => void;
  requiredFileCount?: number;
};

export default function ActionsRow({
  filesReady,
  runState,
  onRun,
  onExcel,
  excelEnabled,
  onToggleKeyMetrics,
  onModalComplete,
  requiredFileCount = 1,
}: Props) {
    const [modalOpen, setModalOpen] = React.useState(false);
    
  return (
    <>
      <div className="report-actions flex items-center justify-center gap-3">
        <ReportButtons
          onRun={onRun}
          filesReady={filesReady}
          running={runState === 'running'}
          downloadHref={"#"} // Download templates is always available
          onExcel={onExcel}
          excelEnabled={excelEnabled}
          onKeyMetrics={runState === 'success' ? onToggleKeyMetrics : undefined}
          onDownloadClick={() => setModalOpen(true)}
        />
      </div>

      <ReportDownloadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Download Required Reports"
        onComplete={onModalComplete}
        requiredFileCount={requiredFileCount}
      />
    </>
  );
}
