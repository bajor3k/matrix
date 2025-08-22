
"use client";

import ReportScaffold from "@/components/ReportScaffold";

export default function BillingCoveragePage() {
    return (
        <ReportScaffold
          reportName="Test"
          summary=""
          instructions=""
          mergeApiPath="/api/reports/test/merge"
        />
      );
}
