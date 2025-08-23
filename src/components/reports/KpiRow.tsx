// src/components/reports/KpiRow.tsx
import * as React from "react";
import { StatCard } from "./StatCard";

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function formatInt(n: number) {
  return n.toLocaleString();
}

export function KpiRow({
  totalAdvisoryFees,
  totalAccounts,
  flaggedShort,
  totalRows,
}: {
  totalAdvisoryFees: number;
  totalAccounts: number;
  flaggedShort: number;
  totalRows: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Total Advisory Fees" value={formatCurrency(totalAdvisoryFees)} />
      <StatCard label="Total Accounts" value={formatInt(totalAccounts)} />
      <StatCard label="Flagged Short" value={formatInt(flaggedShort)} />
      <StatCard label="Total Rows" value={formatInt(totalRows)} />
    </div>
  );
}
