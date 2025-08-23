// components/reports/ActionsRow.tsx
"use client";

import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";     // already added earlier
import type { TableRow } from "@/utils/csv";

type Props = {
  uploadedCount: number;          // how many files uploaded (0..3)
  canRun: boolean;                // true when the required files are present
  hasResults: boolean;            // true after Python run finished & results ready
  tableRows: TableRow[];          // current table rows for CSV
  onRun: () => void;
  onDownloadExcel: () => void;
  onOpenDashboard: () => void;
};

export default function ActionsRow({
  uploadedCount,
  canRun,
  hasResults,
  tableRows,
  onRun,
  onDownloadExcel,
  onOpenDashboard,
}: Props) {
  const noUploads = uploadedCount === 0;

  // --- Disabled logic per your spec ---
  const runDisabled = !canRun;                 // enabled only when required uploads are present
  const excelDisabled = !hasResults;           // enabled after run
  const csvDisabled = !hasResults;             // enabled after run
  const openDisabled = !hasResults;            // enabled after run

  // If NO uploads at all, all four show disabled + red strike hover
  const allDisabled = noUploads;

  // Guarded handlers
  const safeRun = () => { if (!runDisabled && !allDisabled) onRun(); };
  const safeExcel = () => { if (!excelDisabled && !allDisabled) onDownloadExcel(); };
  const safeCsv = () => { if (!csvDisabled && !allDisabled) downloadCSV(tableRows); };
  const safeOpen = () => { if (!openDisabled && !allDisabled) onOpenDashboard(); };

  // Helper to compute classes
  const cx = (disabled: boolean) =>
    ["btn-secondary", (disabled || allDisabled) ? "btn-disabled" : ""].join(" ").trim();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {/* Run Report (SAME colorway as the others) */}
      <button
        type="button"
        aria-disabled={runDisabled || allDisabled}
        disabled={runDisabled || allDisabled}
        onClick={safeRun}
        className={cx(runDisabled)}
        title={runDisabled || allDisabled ? "Upload required files to run" : "Run Report"}
      >
        Run Report
      </button>

      {/* Download Excel */}
      <button
        type="button"
        aria-disabled={excelDisabled || allDisabled}
        disabled={excelDisabled || allDisabled}
        onClick={safeExcel}
        className={cx(excelDisabled)}
        title={excelDisabled || allDisabled ? "Run the report first" : "Download Excel"}
      >
        <Download className="btn-icon" />
        Download Excel
      </button>

      {/* Download CSV */}
      <button
        type="button"
        aria-disabled={csvDisabled || allDisabled}
        disabled={csvDisabled || allDisabled}
        onClick={safeCsv}
        className={cx(csvDisabled)}
        title={csvDisabled || allDisabled ? "Run the report first" : "Download CSV"}
      >
        <Download className="btn-icon" />
        Download CSV
      </button>

      {/* Open Dashboard */}
      <button
        type="button"
        aria-disabled={openDisabled || allDisabled}
        disabled={openDisabled || allDisabled}
        onClick={safeOpen}
        className={cx(openDisabled)}
        title={openDisabled || allDisabled ? "Run the report first" : "Open Dashboard"}
      >
        Open Dashboard
      </button>
    </div>
  );
}
