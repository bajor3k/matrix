// src/app/reports/3m-cash/page.tsx
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import { ReportSection } from "@/components/reports/ReportSection";
import { UploadRow } from "@/components/reports/UploadRow";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";
import type { DonutSlice, Kpi, TableRow } from "@/components/reports/ReportsDashboard.types";
import FullBleed from "@/components/layout/FullBleed";

type UploadKey = "pyfee" | "pycash_2" | "pypi";

const REPORT_SUMMARY =
  "This report analyzes all managed client accounts and isolates advisor-directed accounts to determine how much cash should be reserved to cover advisory fees for the next 3 and 6 months. It takes into account periodic instructions for each account, and lets you know the available cash and MMF for each account.";

const INSTRUCTIONS: string[] = [
  "In Report Center, run Report ID: PYFEE. Download it and upload to the first box.",
  "In Report Center, run Report ID PYCASH. Download it and upload to the second box.",
  "In Report Center, run Report ID PYPI. Download it and upload to the third box.",
];

// Helper to safely format numbers as currency
const money = (n: any, decimals = 2): string => {
  const x = Number(n);
  if (!isFinite(x)) return '';
  return x.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Helper to safely parse string to number
const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[, $]/g,'')); // More robust cleaning
  return isFinite(n) ? n : null;
}

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<Record<UploadKey, File | null>>({
    pyfee: null,
    pycash_2: null,
    pypi: null,
  });
  const [ok, setOk] = React.useState<Record<UploadKey, boolean>>({
    pyfee: false,
    pycash_2: false,
    pypi: false,
  });

  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<any | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const allReady = ok.pyfee && ok.pycash_2 && ok.pypi;

  function accept(key: UploadKey, f: File | null) {
    setFiles((s) => ({ ...s, [key]: f }));
    setOk((s) => ({ ...s, [key]: !!f }));
  }

  // New function to transform API data into dashboard props
  function transformDataForDashboard(data: any[]): { kpis: Kpi[], donutData: DonutSlice[], tableRows: TableRow[] } | null {
    if (!data || data.length === 0) return null;

    const tableRows: TableRow[] = data.map(r => ({
      ip: r['IP'] ?? '',
      acct: r['Account'] ?? '',
      value: money(r['Value']),
      fee: money(r['Advisory Fee']),
      cash: money(r['Cash']),
      short: (num(r['Cash']) ?? 0) < (num(r['Advisory Fee']) ?? 0),
    }));

    const kpis: Kpi[] = [
      { label: "Total Advisory Fees", value: money(tableRows.reduce((sum, row) => sum + (num(row.fee) || 0), 0)) },
      { label: "Total Accounts", value: tableRows.length.toLocaleString() },
      { label: "Flagged Short", value: tableRows.filter(r => r.short).length.toLocaleString() }
    ];

    const feesByIp: Record<string, number> = tableRows.reduce((acc, row) => {
        const ip = row.ip || '(Unspecified)';
        acc[ip] = (acc[ip] || 0) + (num(row.fee) || 0);
        return acc;
    }, {} as Record<string, number>);

    const donutData: DonutSlice[] = Object.entries(feesByIp).map(([name, value]) => ({ name, value }));

    return { kpis, donutData, tableRows };
  }


  async function runMergeJSON() {
    if (!allReady) return;
    setIsRunning(true);
    setError(null);
    setShowDash(false);
    setDashboardData(null);
    try {
      const fd = new FormData();
      fd.append("pycash_1", files.pyfee!);
      fd.append("pycash_2", files.pycash_2!);
      fd.append("pypi", files.pypi!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setDashboardData(transformDataForDashboard(rows));
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
    } finally {
      setIsRunning(false);
    }
  }

  async function downloadExcel() {
    if (!allReady) return;
    try {
      const fd = new FormData();
      fd.append("pycash_1", files.pyfee!);
      fd.append("pycash_2", files.pycash_2!);
      fd.append("pypi", files.pypi!);
      const res = await fetch("/api/reports/3m-cash/merge?format=xlsx", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      saveAs(blob, "3m_cash_merged.xlsx");
    } catch (e: any) {
       setError(e?.message || "Failed to download Excel file.");
    }
  }

  const handleOpenDashboard = () => {
    if(dashboardData) setShowDash(true);
  }

  return (
    <ReportsPageShell>
      <FullBleed>
        <ReportSection title="Report Summary">
            <p>{REPORT_SUMMARY}</p>
        </ReportSection>
      </FullBleed>

      <FullBleed>
        <ReportSection title="Instructions">
            <ol className="list-decimal list-inside space-y-1">
            {INSTRUCTIONS.map((line, i) => (
                <li key={i}>{line}</li>
            ))}
            </ol>
        </ReportSection>
      </FullBleed>
      
      <FullBleed>
        <UploadRow>
            <UploadCard onFileAccepted={(f) => accept("pyfee", f)} onFileCleared={() => accept("pyfee", null)} dropzoneText="Drop PYFEE here" />
            <UploadCard onFileAccepted={(f) => accept("pycash_2", f)} onFileCleared={() => accept("pycash_2", null)} dropzoneText="Drop PYCASH here" />
            <UploadCard onFileAccepted={(f) => accept("pypi", f)} onFileCleared={() => accept("pypi", null)} dropzoneText="Drop PYPI here" />
        </UploadRow>
      </FullBleed>
        
      <FullBleed>
        <div className="flex flex-col items-center gap-3 pt-2">
            <button
            onClick={runMergeJSON}
            disabled={!allReady || isRunning}
            className={cn(
                "rounded-2xl px-5 py-3 text-sm font-semibold transition shadow-sm",
                allReady && !isRunning ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" : "bg-[#2f3136] text-zinc-400 cursor-not-allowed"
            )}
            >
            {isRunning ? "Running…" : "Run 3M Cash Report"}
            </button>

            <div className="flex gap-3">
            <button
                onClick={downloadExcel}
                disabled={!dashboardData || isRunning}
                className={cn(
                "rounded-xl px-4 py-2 text-sm transition border border-border",
                !dashboardData ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-card hover:bg-muted"
                )}
            >
                Download Excel
            </button>
            <button
                onClick={() => setShowDash(v => !v)}
                disabled={!dashboardData || isRunning}
                className={cn(
                "rounded-xl px-4 py-2 text-sm transition border border-border",
                !dashboardData ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-card hover:bg-muted"
                )}
            >
                {showDash ? "Hide Dashboard" : "Open Dashboard"}
            </button>
            </div>

            {error && <div className="text-xs text-rose-400">{error}</div>}
        </div>
      </FullBleed>

        {showDash && dashboardData && (
            <ReportsDashboard {...dashboardData} />
        )}
    </ReportsPageShell>
  );
}
