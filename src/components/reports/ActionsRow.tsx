// components/reports/ActionsRow.tsx
"use client";

import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import type { TableRow } from "@/utils/csv";

type Props = {
  /** One boolean per file slot; true if that slot has a file. Example: [true, false, true] */
  uploadedFlags: boolean[];
  /** How many files are required to enable Run Report. Default: uploadedFlags.length */
  requiredCount?: number;
  /** True after the Python pipeline finishes successfully (results ready). */
  hasResults: boolean;
  /** Data currently shown in the table — used for CSV export. */
  tableRows: TableRow[];
  onRun: () => void;
  onDownloadExcel: () => void;
  onOpenDashboard: () => void;
};

export default function ActionsRow({
  uploadedFlags,
  requiredCount,
  hasResults,
  tableRows,
  onRun,
  onDownloadExcel,
  onOpenDashboard,
}: Props) {
  const req = Math.max(requiredCount ?? uploadedFlags.length, 1);

  // Strict: require ALL of the first `req` slots to be truthy.
  const allUploaded =
    uploadedFlags.length >= req &&
    uploadedFlags.slice(0, req).every(Boolean);

  // Enablement rules
  const runEnabled = allUploaded;
  const downloadsReady = hasResults;

  // Guarded handlers
  const safeRun = () => { if (runEnabled) onRun(); };
  const safeExcel = () => { if (downloadsReady) onDownloadExcel(); };
  const safeCsv = () => { if (downloadsReady) downloadCSV(tableRows); };
  const safeOpen = () => { if (downloadsReady) onOpenDashboard(); };

  // Class helpers
  const clsRun = runEnabled ? "btn-primary" : "btn-secondary btn-disabled";
  const clsReady = (ready: boolean) =>
    ready ? "btn-secondary btn-secondary--ready" : "btn-secondary btn-disabled";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {/* Run Report — ONLY turns green when ALL required files uploaded */}
      <button
        type="button"
        onClick={safeRun}
        aria-disabled={!runEnabled}
        disabled={!runEnabled}
        className={clsRun}
        title={runEnabled ? "Run Report" : "Upload all required files first"}
      >
        Run Report
      </button>

      {/* Download Excel — emphasized text when ready (NOT green) */}
      <button
        type="button"
        onClick={safeExcel}
        aria-disabled={!downloadsReady}
        disabled={!downloadsReady}
        className={clsReady(downloadsReady)}
        title={downloadsReady ? "Download Excel" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download Excel
      </button>

      {/* Download CSV — emphasized text when ready (NOT green) */}
      <button
        type="button"
        onClick={safeCsv}
        aria-disabled={!downloadsReady}
        disabled={!downloadsReady}
        className={clsReady(downloadsReady)}
        title={downloadsReady ? "Download CSV" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download CSV
      </button>

      {/* Open Dashboard — emphasized text when ready (NOT green) */}
      <button
        type="button"
        onClick={safeOpen}
        aria-disabled={!downloadsReady}
        disabled={!downloadsReady}
        className={clsReady(downloadsReady)}
        title={downloadsReady ? "Open Dashboard" : "Run the report first"}
      >
        Open Dashboard
      </button>
    </div>
  );
}
