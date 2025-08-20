"use client";

import ReportScaffold from "@/components/ReportScaffold";

export default function CashAlertsPage() {
    return (
        <ReportScaffold
          reportName="Cash Balance"
          summary=""         // blank on purpose
          instructions=""    // blank on purpose
          mergeApiPath="/api/reports/cash-balance/merge"  // TODO: implement
        />
      );
}
