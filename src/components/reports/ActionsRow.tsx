// components/reports/ActionsRow.tsx
"use client";

import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import type { TableRow } from "@/utils/csv";

type Props = {
  uploadedCount: number;          // current number of uploaded files
  requiredCount?: number;         // defaults to 3
  hasResults: boolean;            // true after the Python run completes successfully
  tableRows: TableRow[];          // what you render in the table
  onRun: () => void;
  onDownloadExcel: () => void;
  onOpenDashboard: () => void;
};

export default function ActionsRow({
  uploadedCount,
  requiredCount = 3,
  hasResults,
  tableRows,
  onRun,
  onDownloadExcel,
  onOpenDashboard,
}: Props) {
  const allUploaded = uploadedCount >= requiredCount;

  // Enablement rules
  const runEnabled = allUploaded;              // turns green when all uploaded
  const downloadsEnabled = hasResults;         // turn green after a successful run

  // Guarded handlers (never fire while disabled)
  const handleRun = () => { if (runEnabled) onRun(); };
  const handleExcel = () => { if (downloadsEnabled) onDownloadExcel(); };
  const handleCsv = () => { if (downloadsEnabled) downloadCSV(tableRows); };
  const handleOpen = () => { if (downloadsEnabled) onOpenDashboard(); };

  // Pick class per button state
  const cls = (enabled: boolean) =>
    enabled ? "btn-primary" : "btn-secondary btn-disabled";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {/* Run Report — green after all uploads */}
      <button
        type="button"
        onClick={handleRun}
        aria-disabled={!runEnabled}
        disabled={!runEnabled}
        className={cls(runEnabled)}
        title={runEnabled ? "Run Report" : "Upload all required files first"}
      >
        Run Report
      </button>

      {/* Download Excel — green after run */}
      <button
        type="button"
        onClick={handleExcel}
        aria-disabled={!downloadsEnabled}
        disabled={!downloadsEnabled}
        className={cls(downloadsEnabled)}
        title={downloadsEnabled ? "Download Excel" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download Excel
      </button>

      {/* Download CSV — green after run */}
      <button
        type="button"
        onClick={handleCsv}
        aria-disabled={!downloadsEnabled}
        disabled={!downloadsEnabled}
        className={cls(downloadsEnabled)}
        title={downloadsEnabled ? "Download CSV" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download CSV
      </button>

      {/* Open Dashboard — green after run */}
      <button
        type="button"
        onClick={handleOpen}
        aria-disabled={!downloadsEnabled}
        disabled={!downloadsEnabled}
        className={cls(downloadsEnabled)}
        title={downloadsEnabled ? "Open Dashboard" : "Run the report first"}
      >
        Open Dashboard
      </button>
    </div>
  );
}
