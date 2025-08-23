// src/app/reports/3m-cash/page.tsx
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "@/components/reports/HelpHeader";
import { UploadRow } from "@/components/reports/UploadRow";
import type { TableRow } from "@/components/reports/ReportsDashboard.types";
import FullBleed from "@/components/layout/FullBleed";
import { saveAs } from "file-saver";
import ActionsRow from "@/components/reports/ActionsRow";


const REPORT_SUMMARY =
  "This report analyzes all managed client accounts and isolates advisor-directed accounts to determine how much cash should be reserved to cover advisory fees for the next 3 and 6 months. It takes into account periodic instructions for each account, and lets you know the available cash and MMF for each account.";

const INSTRUCTIONS = (
    <ol className="list-decimal pl-5 space-y-1">
        <li>In Report Center, run Report ID: PYFEE. Download it and upload to the first box.</li>
        <li>In Report Center, run Report ID PYCASH. Download it and upload to the second box.</li>
        <li>In Report Center, run Report ID PYPI. Download it and upload to the third box.</li>
    </ol>
);

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

interface DashboardData {
    metrics: {
        totalAdvisoryFees: string;
        totalAccounts: number;
        flaggedShort: number;
    };
    tableRows: TableRow[];
}

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [showDash, setShowDash] = React.useState(false);
  const [reportStatus, setReportStatus] = React.useState<"idle" | "running" | "success" | "error">("idle");

  const requiredCount = 3;
  const hasResults = reportStatus === "success";
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

  // New function to transform API data into dashboard props
  function transformDataForDashboard(data: any[]): DashboardData | null {
    if (!data || data.length === 0) return null;

    const tableRows: TableRow[] = data.map(r => ({
      ip: r['IP'] ?? '',
      acct: r['Account'] ?? '',
      value: money(r['Value']),
      fee: money(r['Advisory Fee']),
      cash: money(r['Cash']),
      short: (num(r['Cash']) ?? 0) < (num(r['Advisory Fee']) ?? 0),
    }));

    const metrics = {
        totalAdvisoryFees: money(tableRows.reduce((sum, row) => sum + (num(row.fee) || 0), 0)),
        totalAccounts: tableRows.length,
        flaggedShort: tableRows.filter(r => r.short).length
    };

    return { metrics, tableRows };
  }


  async function runMergeJSON() {
    if (uploadedFlags.filter(Boolean).length < requiredCount) return;
    setReportStatus("running");
    setError(null);
    setShowDash(false);
    setDashboardData(null);
    try {
      const fd = new FormData();
      fd.append("pycash_1", files[0]!);
      fd.append("pycash_2", files[1]!);
      fd.append("pypi", files[2]!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
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
    try {
      const fd = new FormData();
      fd.append("pycash_1", files[0]!);
      fd.append("pycash_2", files[1]!);
      fd.append("pypi", files[2]!);
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
        <HelpHeader summary={REPORT_SUMMARY} instructions={INSTRUCTIONS} />
      </FullBleed>
      
      <FullBleed>
        <UploadRow>
          <UploadCard file={files[0]} onFileChange={handleFileChange(0)} dropzoneText="Drop PYFEE here" />
          <UploadCard file={files[1]} onFileChange={handleFileChange(1)} dropzoneText="Drop PYCASH here" />
          <UploadCard file={files[2]} onFileChange={handleFileChange(2)} dropzoneText="Drop PYPI here" />
        </UploadRow>
      </FullBleed>
        
      <FullBleed>
        <ActionsRow
            uploadedFlags={uploadedFlags}
            requiredCount={3}
            hasResults={hasResults}
            tableRows={dashboardData?.tableRows || []}
            onRun={runMergeJSON}
            onDownloadExcel={downloadExcel}
            onOpenDashboard={handleOpenDashboard}
        />
        {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
         {reportStatus === "running" && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
      </FullBleed>

      {showDash && dashboardData && (
        <ReportsDashboard 
            metrics={dashboardData.metrics}
            onAsk={(q) => console.log("User asked:", q)}
        />
      )}
    </ReportsPageShell>
  );
}
