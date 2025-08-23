
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import ReportsDashboard from "./reports/ReportsDashboard";
import type { TableRow } from "./reports/ResultsTableCard";
import ReportsPageShell from "./reports/ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "./reports/HelpHeader";
import { UploadRow } from "./reports/UploadRow";
import FullBleed from "./layout/FullBleed";
import ActionsRow from "./reports/ActionsRow";
import { saveAs } from "file-saver";
import ResultsTableCard from "./reports/ResultsTableCard";
import { downloadCSV } from "@/utils/csv";

type Props = {
  reportName: string;
  summary?: string | React.ReactNode;
  instructions?: React.ReactNode;
  mergeApiPath?: string;
  requiredFileCount?: 1 | 2 | 3;
};

interface DashboardMetrics {
    totalAdvisoryFees: string;
    totalAccounts: number;
    flaggedShort: number;
    totalRows: number;
}

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
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
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

  const filesReady = files.slice(0, requiredFileCount).every(Boolean);

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
      acct: r['Account Number'] ?? '',
      value: money(r['Value']),
      fee: money(r['Advisory Fees']),
      cash: money(r['Cash']),
      short: (num(r['Cash']) ?? 0) < (num(r['Advisory Fees']) ?? 0),
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
    setRunState("running"); 
    setError(null); 

    try {
      const fd = new FormData();
      if (files[0]) fd.append("fileA", files[0]);
      if (files[1]) fd.append("fileB", files[1]);
      if (files[2]) fd.append("fileC", files[2]);
      
      const res = await fetch(`${mergeApiPath}?format=json`, { method: "POST", body: fd });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "An unknown error occurred.");
      }
      const rows = await res.json();
      
      processApiData(rows);
      setRunState("success");
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
      setRunState("error");
    }
  }

  async function downloadExcel() {
    if (runState !== "success") return;
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
    }
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
          filesReady={filesReady}
          runState={runState}
          dashboardVisible={dashboardVisible}
          onRun={runReport}
          onDownloadExcel={downloadExcel}
          onDownloadCsv={() => downloadCSV(tableRows)}
          onToggleDashboard={() => setDashboardVisible(v => !v)}
        />
        {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
        {runState === 'running' && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
      </FullBleed>

      {dashboardVisible && runState === 'success' && (
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
