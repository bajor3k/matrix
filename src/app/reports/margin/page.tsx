"use client";

import ReportScaffold from "@/components/ReportScaffold";

export default function MarginNotifyPage() {
    return (
        <ReportScaffold
          reportName="Margin"
          summary=""
          instructions=""
          mergeApiPath="/api/reports/margin/merge"
        />
      );
}
