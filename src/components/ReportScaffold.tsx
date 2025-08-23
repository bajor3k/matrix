
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import ReportsDashboard from "./reports/ReportsDashboard";
import type { DonutSlice, Kpi, TableRow } from "./reports/ReportsDashboard.types";
import ReportsPageShell from "./reports/ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "./reports/HelpHeader";
import { UploadRow } from "./reports/UploadRow";
import FullBleed from "./layout/FullBleed";
import ActionsRow from "./reports/ActionsRow";
import { saveAs } from "file-saver";

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
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  const [reportStatus, setReportStatus] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<{ kpis: Kpi[], donutData: DonutSlice[], tableRows: TableRow[] } | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const hasResults = reportStatus === "success" && dashboardData !== null;
  const uploadedFlags = files.map(f => !!f);

  const handleFileChange = (index: number) => (file: File | null) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index] = file;
      if (newFiles.filter(Boolean).length === 1 && file !== null) {
        helpHeaderAutoDismiss();
      }
      return newFiles;
    });
  };

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
    if (uploadedFlags.filter(Boolean).length < requiredFileCount) return;
    setReportStatus("running"); 
    setError(null); 
    setShowDash(false); 
    setDashboardData(null);
    try {
      const fd = new FormData();
      if (files[0]) fd.append("fileA", files[0]);
      if (files[1]) fd.append("fileB", files[1]);
      if (files[2]) fd.append("fileC", files[2]);
      
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
    if (files[0]) fd.append("fileA", files[0]);
    if (files[1]) fd.append("fileB", files[1]);
    if (files[2]) fd.append("fileC", files[2]);

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
          {Array.from({ length: requiredFileCount }).map((_, index) => (
            <UploadCard
              key={index}
              file={files[index]}
              onFileChange={handleFileChange(index)}
              dropzoneText={`Drop File ${index + 1} here`}
            />
          ))}
        </UploadRow>
      </FullBleed>
      
      <FullBleed>
        <ActionsRow
          uploadedFlags={uploadedFlags}
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
