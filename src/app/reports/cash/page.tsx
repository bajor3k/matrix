// src/app/reports/cash/page.tsx
"use client";

import ReportScaffold from "@/components/reports/ReportScaffold";

const summary = "This report merges two cash summary files to provide a consolidated view of account cash balances and positions.";
const instructions = (
  <ol className="list-decimal list-inside space-y-1">
    <li>Upload the two required cash report files.</li>
    <li>Click "Run Report" to merge the data.</li>
    <li>The results will be displayed in the table below.</li>
    <li>Use the "Download" button to get the merged file in Excel format.</li>
  </ol>
);

export default function CashReportPage() {
  return (
    <ReportScaffold
      reportName="Cash Balance Report"
      summary={summary}
      instructions={instructions}
      mergeApiPath="/api/reports/3m-cash/merge" // Note: Reusing existing API for demonstration
      requiredFileCount={2}
      fileLabels={["Drop PYCASH1 here", "Drop PYCASH2 here"]}
    />
  );
}
