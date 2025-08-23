// src/app/reports/3m-cash/page.tsx
"use client";

import React from "react";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "@/components/reports/HelpHeader";
import { UploadRow } from "@/components/reports/UploadRow";
import type { TableRow } from "@/components/reports/ResultsTableCard";
import FullBleed from "@/components/layout/FullBleed";
import { saveAs } from "file-saver";
import ActionsRow from "@/components/reports/ActionsRow";
import UploadCard from "@/components/UploadCard";
import ResultsTableCard from "@/components/reports/ResultsTableCard";
import { downloadCSV } from "@/utils/csv";


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

interface DashboardMetrics {
    totalAdvisoryFees: string;
    totalAccounts: number;
    flaggedShort: number;
    totalRows: number;
}

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  const [error, setError] = React.useState<string | null>(null);
  const [reportStatus, setReportStatus] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [dashboardVisible, setDashboardVisible] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Ask a question about this report (fees, accounts, flagged short, etc.).' },
  ]);

  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
      totalAdvisoryFees: "$0.00",
      totalAccounts: 0,
      flaggedShort: 0,
      totalRows: 0,
  });
  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);

  const filesReady = files.filter(Boolean).length === 3;

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

  function processApiData(data: any[]) {
    if (!data || data.length === 0) {
      setMetrics({ totalAdvisoryFees: '$0.00', totalAccounts: 0, flaggedShort: 0, totalRows: 0 });
      setTableRows([]);
      return;
    }

    const rows: TableRow[] = data.map(r => ({
      ip: r['IP'] ?? '',
      acct: r['Account'] ?? '',
      value: money(r['Value']),
      fee: money(r['Advisory Fee']),
      cash: money(r['Cash']),
      short: (num(r['Cash']) ?? 0) < (num(r['Advisory Fee']) ?? 0),
    }));

    const newMetrics = {
        totalAdvisoryFees: money(rows.reduce((sum, row) => sum + (num(row.fee) || 0), 0)),
        totalAccounts: rows.length,
        flaggedShort: rows.filter(r => r.short).length,
        totalRows: rows.length,
    };
    
    setTableRows(rows);
    setMetrics(newMetrics);
  }

  const handleAsk = (question: string) => {
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);
    // Placeholder for LLM response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Thanks for asking! This feature is coming soon.' },
      ]);
    }, 1000);
  };

  async function runReport() {
    if (!filesReady) return;
    setReportStatus("running");
    setError(null);

    try {
      const fd = new FormData();
      fd.append("pycash_1", files[0]!);
      fd.append("pycash_2", files[1]!);
      fd.append("pypi", files[2]!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      
      processApiData(rows);
      setReportStatus("success");
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
      setReportStatus("error");
    }
  }

  async function downloadExcel() {
    if (reportStatus !== "success") return;
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
            filesReady={filesReady}
            reportStatus={reportStatus}
            dashboardVisible={dashboardVisible}
            onRun={runReport}
            onDownloadExcel={downloadExcel}
            onDownloadCsv={() => downloadCSV(tableRows)}
            onToggleDashboard={() => setDashboardVisible(v => !v)}
        />
        {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
         {reportStatus === "running" && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
      </FullBleed>

      {dashboardVisible && (
        <>
          <ReportsDashboard 
              metrics={metrics}
              messages={chatMessages}
              onAsk={handleAsk}
          />
          <ResultsTableCard rows={tableRows} />
        </>
      )}
    </ReportsPageShell>
  );
}
