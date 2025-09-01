// src/app/reports/advisory-fees/page.tsx
"use client";

import ReportScaffold from "@/components/reports/ReportScaffold";

const summary = "This report merges three cash-related files to provide a consolidated view of accounts, their cash positions, and advisory fees.";
const instructions = (
  <ol className="list-decimal list-inside space-y-1">
    <li>Upload the three required files: PYCASH1, PYCASH2, and PYFEE.</li>
    <li>Click "Run Report" to merge the data.</li>
    <li>The results will be displayed in the table below.</li>
    <li>Use the "Download" button to get the merged file in Excel format.</li>
  </ol>
);

export default function AdvisoryFeesPage() {
  return (
    <ReportScaffold
      reportName="Advisory Fees Report"
      summary={summary}
      instructions={instructions}
      mergeApiPath="/api/reports/3m-cash/merge"
      requiredFileCount={3}
      fileLabels={["Drop PYCASH1 here", "Drop PYCASH2 here", "Drop PYFEE here"]}
    />
  );
}
