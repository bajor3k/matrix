"use client";

import ReportScaffold from "@/components/ReportScaffold";

export default function BillingCoveragePage() {
    return (
        <ReportScaffold
          reportName="Test"
          summary="This is a test report dashboard. Upload files with columns for 'IP', 'Account Number', 'Value', 'Advisory Fees', and 'Cash' to see the dashboard."
          instructions="Upload up to three XLSX or CSV files below. The data will be merged based on 'IP' and 'Account Number' columns."
          mergeApiPath="/api/reports/test/merge"
          requiredFileCount={3}
        />
      );
}
