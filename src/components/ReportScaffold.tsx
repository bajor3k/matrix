
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import { cn } from "@/lib/utils";
import Script from "next/script";
import ReportsDashboard from "./reports/ReportsDashboard";
import type { DonutSlice, Kpi, TableRow } from "./reports/ReportsDashboard.types";
import ReportsPageShell from "./reports/ReportsPageShell";
import { ReportSection } from "./reports/ReportSection";
import { UploadRow } from "./reports/UploadRow";
import FullBleed from "./layout/FullBleed";
import { downloadCSV } from "@/utils/csv";
import { Download } from "lucide-react";

type Key = "a" | "b" | "c";

type Props = {
  reportName: string;
  summary?: string;
  instructions?: string;
  mergeApiPath?: string;
};

// Helper to safely format numbers as currency
const money = (n: any, decimals = 2): string => {
  const x = Number(n);
  if (!isFinite(x)) return '';
  return x.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Helper to safely parse string to number
const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[, $]/g,''));
  return isFinite(n) ? n : null;
}

export default function ReportScaffold({
  reportName,
  summary = "",
  instructions = "",
  mergeApiPath = "/api/reports/TBD/merge",
}: Props) {
  const [files, setFiles] = React.useState<Record<Key, File | null>>({
    a: null, b: null, c: null,
  });
  const [ok, setOk] = React.useState<Record<Key, boolean>>({
    a: false, b: false, c: false,
  });
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<{ kpis: Kpi[], donutData: DonutSlice[], tableRows: TableRow[] } | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const allReady = ok.a || ok.b || ok.c;

  React.useEffect(() => {
    const handleCleared = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { slotId } = customEvent.detail;
      if (slotId && slotId.includes('upload-a')) setFiles(s => ({...s, a: null})), setOk(s => ({...s, a: false}));
      if (slotId && slotId.includes('upload-b')) setFiles(s => ({...s, b: null})), setOk(s => ({...s, b: false}));
      if (slotId && slotId.includes('upload-c')) setFiles(s => ({...s, c: null})), setOk(s => ({...s, c: false}));
    }
    window.addEventListener('upload:cleared', handleCleared);
    return () => window.removeEventListener('upload:cleared', handleCleared);
  }, []);

  function accept(key: Key, f: File) {
    setFiles((s) => ({ ...s, [key]: f }));
    setOk((s) => ({ ...s, [key]: true }));
  }

  function transformDataForDashboard(data: any[]): { kpis: Kpi[], donutData: DonutSlice[], tableRows: TableRow[] } | null {
    if (!data || data.length === 0) return null;

    const tableRows: TableRow[] = data.map(r => ({
      ip: r['IP'] ?? '',
      acct: r['Account Number'] ?? '',
      value: money(r['Value']),
      fee: money(r['Advisory Fees']),
      cash: money(r['Cash']),
      short: (num(r['Cash']) ?? 0) < (num(r['Advisory Fees']) ?? 0),
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
    setIsRunning(true); setError(null); setShowDash(false); setDashboardData(null);
    try {
      const fd = new FormData();
      if (files.a) fd.append("fileA", files.a);
      if (files.b) fd.append("fileB", files.b);
      if (files.c) fd.append("fileC", files.c);
      
      const res = await fetch(`${mergeApiPath}?format=json`, { method: "POST", body: fd });
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
    const fd = new FormData();
    if (files.a) fd.append("fileA", files.a);
    if (files.b) fd.append("fileB", files.b);
    if (files.c) fd.append("fileC", files.c);

    const res = await fetch(`${mergeApiPath}?format=xlsx`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reportName.replace(/\s+/g, "_").toLowerCase()}_merged.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  
  const handleOpenDashboard = () => {
    if (dashboardData) setShowDash(true);
  }

  const handleHideDashboard = () => {
      setShowDash(false);
  }


  return (
    <ReportsPageShell>
      {summary && (
        <FullBleed>
          <ReportSection title="Report Summary">
              <p>{summary}</p>
          </ReportSection>
        </FullBleed>
      )}

      {instructions && (
        <FullBleed>
          <ReportSection title="Instructions">
            <p>{instructions}</p>
          </ReportSection>
        </FullBleed>
      )}
      
      <FullBleed>
        <UploadRow>
          <UploadCard slotId="upload-a" onFileAccepted={(f)=>accept("a",f)} onFileCleared={() => accept("a", null)} dropzoneText="Drop File 1 here"/>
          <UploadCard slotId="upload-b" onFileAccepted={(f)=>accept("b",f)} onFileCleared={() => accept("b", null)} dropzoneText="Drop File 2 here"/>
          <UploadCard slotId="upload-c" onFileAccepted={(f)=>accept("c",f)} onFileCleared={() => accept("c", null)} dropzoneText="Drop File 3 here"/>
        </UploadRow>
      </FullBleed>
      
      <FullBleed>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={runMergeJSON}
            disabled={!allReady || isRunning}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold text-black transition shadow-sm",
              allReady && !isRunning ? "bg-[#08e28f] hover:opacity-90"
                                     : "bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            {isRunning ? "Running…" : "Run Report"}
          </button>

          <button
            onClick={downloadExcel}
            disabled={!dashboardData || isRunning}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>

          <button
            onClick={() => dashboardData && downloadCSV(dashboardData.tableRows)}
            disabled={!dashboardData || isRunning}
            className="btn-secondary"
            aria-label="Download CSV"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>

          <button
            onClick={showDash ? handleHideDashboard : handleOpenDashboard}
            disabled={!dashboardData || isRunning}
            className="btn-secondary"
          >
            {showDash ? "Hide Dashboard" : "Open Dashboard"}
          </button>
        </div>
        {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
      </FullBleed>

      {showDash && dashboardData && (
          <ReportsDashboard {...dashboardData} />
      )}
    </ReportsPageShell>
  );
}
