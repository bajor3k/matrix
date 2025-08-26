"use client";

import ReportScaffold from "@/components/ReportScaffold";

export default function AdvisorSummaryPage() {
    return (
        <ReportScaffold
          reportName="Advisory Fees"
          summary=""
          instructions=""
          mergeApiPath="/api/reports/advisory-fees/merge"
        />
      );
}
