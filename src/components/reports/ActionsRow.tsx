// components/reports/ActionsRow.tsx
"use client";

import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import type { TableRow } from "@/utils/csv";

type Props = {
  uploadedFlags: boolean[];           // [!!file1, !!file2, !!file3]
  requiredCount?: number;             // default 3
  hasResults: boolean;                // true after run finishes successfully
  dashboardVisible: boolean;          // controls Open/Hide label
  tableRows: TableRow[];
  onRun: () => void;
  onDownloadExcel: () => void;
  onToggleDashboard: () => void;      // <-- toggle only when hasResults
};

export default function ActionsRow({
  uploadedFlags,
  requiredCount = 3,
  hasResults,
  dashboardVisible,
  tableRows,
  onRun,
  onDownloadExcel,
  onToggleDashboard,
}: Props) {
  const allUploaded =
    uploadedFlags.length >= requiredCount &&
    uploadedFlags.slice(0, requiredCount).every(Boolean);

  const runEnabled = allUploaded;
  const resultsReady = hasResults;

  const clsPrimary = (enabled: boolean) =>
    enabled ? "btn-primary" : "btn-secondary btn-disabled";
  const clsReady = (ready: boolean) =>
    ready ? "btn-secondary btn-secondary--ready" : "btn-secondary btn-disabled";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {/* Run Report */}
      <button
        type="button"
        onClick={() => runEnabled && onRun()}
        disabled={!runEnabled}
        aria-disabled={!runEnabled}
        className={clsPrimary(runEnabled)}
        title={runEnabled ? "Run Report" : "Upload all required files first"}
      >
        Run Report
      </button>

      {/* Download Excel */}
      <button
        type="button"
        onClick={() => resultsReady && onDownloadExcel()}
        disabled={!resultsReady}
        aria-disabled={!resultsReady}
        className={clsReady(resultsReady)}
        title={resultsReady ? "Download Excel" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download Excel
      </button>

      {/* Download CSV */}
      <button
        type="button"
        onClick={() => resultsReady && downloadCSV(tableRows)}
        disabled={!resultsReady}
        aria-disabled={!resultsReady}
        className={clsReady(resultsReady)}
        title={resultsReady ? "Download CSV" : "Run the report first"}
      >
        <Download className="btn-icon" />
        Download CSV
      </button>

      {/* Open / Hide Dashboard (toggles only, never auto-opens) */}
      <button
        type="button"
        onClick={() => resultsReady && onToggleDashboard()}
        disabled={!resultsReady}
        aria-disabled={!resultsReady}
        className={clsReady(resultsReady)}
        title={resultsReady ? "Open or hide the dashboard" : "Run the report first"}
      >
        {dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
      </button>
    </div>
  );
}
