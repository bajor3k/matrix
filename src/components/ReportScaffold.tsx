
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import ReportsDashboard from "./reports/ReportsDashboard";
import type { DonutSlice, Kpi, TableRow } from "./reports/ReportsDashboard.types";
import ReportsPageShell from "./reports/ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "./reports/HelpHeader";
import { UploadRow } from "./reports/UploadRow";
import FullBleed from "./layout/FullBleed";
import { downloadCSV } from "@/utils/csv";
import ActionsRow from "./reports/ActionsRow";
import { saveAs } from "file-saver";


type Key = "a" | "b" | "c";

type Props = {
  reportName: string;
  summary?: string | React.ReactNode;
  instructions?: React.ReactNode;
  mergeApiPath?: string;
  requiredFileCount?: 1 | 2 | 3;
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
  requiredFileCount = 1,
}: Props) {
  const [files, setFiles] = React.useState<Record<Key, File | null>>({
    a: null, b: null, c: null,
  });
  const [ok, setOk] = React.useState<Record<Key, boolean>>({
    a: false, b: false, c: false,
  });
  const [reportStatus, setReportStatus] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<{ kpis: Kpi[], donutData: DonutSlice[], tableRows: TableRow[] } | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const hasResults = reportStatus === "success" && dashboardData !== null;


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
    if (Object.values(files).filter(Boolean).length === 0) {
       helpHeaderAutoDismiss();
    }
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
    if (Object.values(ok).filter(Boolean).length < requiredFileCount) return;
    setReportStatus("running"); 
    setError(null); 
    setShowDash(false); 
    setDashboardData(null);
    try {
      const fd = new FormData();
      if (files.a) fd.append("fileA", files.a);
      if (files.b) fd.append("fileB", files.b);
      if (files.c) fd.append("fileC", files.c);
      
      const res = await fetch(`${mergeApiPath}?format=json`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setDashboardData(transformDataForDashboard(rows));
      setReportStatus("success");
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
      setReportStatus("error");
    }
  }

  async function downloadExcel() {
    if (!hasResults) return;
    const fd = new FormData();
    if (files.a) fd.append("fileA", files.a);
    if (files.b) fd.append("fileB", files.b);
    if (files.c) fd.append("fileC", files.c);

    try {
        const res = await fetch(`${mergeApiPath}?format=xlsx`, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        saveAs(blob, `${reportName.replace(/\s+/g, "_").toLowerCase()}_merged.xlsx`);
    } catch (e: any) {
        setError(e?.message || "Failed to download Excel file.");
        setReportStatus("error");
    }
  }
  
  const handleOpenDashboard = () => {
    if (dashboardData) setShowDash(true);
  }

  return (
    <ReportsPageShell>
      <FullBleed>
        <HelpHeader summary={summary} instructions={instructions} />
      </FullBleed>
      
      <FullBleed>
        <UploadRow>
          <UploadCard slotId="upload-a" onFileAccepted={(f)=>accept("a",f)} dropzoneText="Drop File 1 here"/>
          {requiredFileCount > 1 && <UploadCard slotId="upload-b" onFileAccepted={(f)=>accept("b",f)} dropzoneText="Drop File 2 here"/>}
          {requiredFileCount > 2 && <UploadCard slotId="upload-c" onFileAccepted={(f)=>accept("c",f)} dropzoneText="Drop File 3 here"/>}
        </UploadRow>
      </FullBleed>
      
      <FullBleed>
        <ActionsRow
          uploadedFlags={[ok.a, ok.b, ok.c]}
          requiredCount={requiredFileCount}
          hasResults={hasResults}
          tableRows={dashboardData?.tableRows || []}
          onRun={runMergeJSON}
          onDownloadExcel={downloadExcel}
          onOpenDashboard={handleOpenDashboard}
        />
        {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
        {reportStatus === 'running' && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
      </FullBleed>

      {showDash && dashboardData && (
          <ReportsDashboard {...dashboardData} />
      )}
    </ReportsPageShell>
  );
}
