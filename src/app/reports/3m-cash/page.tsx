// src/app/reports/3m-cash/page.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import { MavenLayout } from "@/components/reports/maven/MavenLayout";
import { indexMergedRows } from '@/lib/askmaven/kb';
import { loadKB } from '@/lib/askmaven/storage';


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
    totalAdvisoryFees: number;
    totalAccounts: number;
    flaggedShort: number;
    totalRows: number;
}

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  const [error, setError] = React.useState<string | null>(null);
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [dashboardVisible, setDashboardVisible] = React.useState(false);
  const [isMavenOpen, setIsMavenOpen] = React.useState(false);

  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
      totalAdvisoryFees: 0,
      totalAccounts: 0,
      flaggedShort: 0,
      totalRows: 0,
  });
  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);
  const [kbLoading, setKbLoading] = React.useState(false);
  const [kbReady, setKbReady] = React.useState(false);
  const [kbCount, setKbCount] = React.useState(0);

  const filesReady = files.filter(Boolean).length === 3;
  const canOpenMaven = runState === "success";

  useEffect(() => {
    let alive = true;
  
    // 1) enable if a KB already exists (e.g., after AskMavenDev.loadSampleKB())
    loadKB().then(kb => {
      if (!alive) return;
      if (kb?.rows?.length) {
        setKbReady(true);
        setKbCount(kb.rows.length);
      }
    });
  
    // 2) enable whenever a new KB is indexed
    const onKB = (e: any) => {
      if (!alive) return;
      setKbReady(true);
      setKbCount(e?.detail?.count ?? 0);
    };
    window.addEventListener("askmaven:kb-updated", onKB);
  
    return () => {
      alive = false;
      window.removeEventListener("askmaven:kb-updated", onKB);
    };
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMavenOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);


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
      setMetrics({ totalAdvisoryFees: 0, totalAccounts: 0, flaggedShort: 0, totalRows: 0 });
      setTableRows([]);
      return;
    }

    let totalFees = 0;
    const accountNumbers = new Set<string>();
    const rows: TableRow[] = data.map(r => {
      const advisoryFee = num(r['Advisory Fee']) ?? 0;
      totalFees += advisoryFee;
      if (r['Account']) {
        accountNumbers.add(r['Account']);
      }
      return {
          ip: r['IP'] ?? '',
          acct: r['Account'] ?? '',
          value: money(r['Value']),
          fee: money(advisoryFee),
          cash: money(r['Cash']),
          short: (num(r['Cash']) ?? 0) < advisoryFee,
      }
    });

    const newMetrics = {
        totalAdvisoryFees: totalFees,
        totalAccounts: accountNumbers.size,
        flaggedShort: rows.filter(r => r.short).length,
        totalRows: rows.length,
    };
    
    setTableRows(rows);
    setMetrics(newMetrics);
  }

  async function runReport() {
    if (!filesReady) return;
    setRunState("running");
    setError(null);
    setKbReady(false);
    setKbCount(0);

    try {
      const fd = new FormData();
      fd.append("pycash_1", files[0]!);
      fd.append("pycash_2", files[1]!);
      fd.append("pypi", files[2]!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      
      processApiData(rows);
      setRunState("success");

      setKbLoading(true);
      try {
        await indexMergedRows(rows);
      } finally {
        setKbLoading(false);
      }

    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
      setRunState("error");
    }
  }

  async function downloadExcel() {
    if (runState !== "success") return;
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

  const openMaven = () => {
    if (!kbReady) return;
    setIsMavenOpen(true);
  };

  return (
    <ReportsPageShell>
      {!isMavenOpen ? (
        <>
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
                runState={runState}
                dashboardVisible={dashboardVisible}
                onRun={runReport}
                onDownloadExcel={downloadExcel}
                onDownloadCsv={() => downloadCSV(tableRows)}
                onToggleDashboard={() => setDashboardVisible(v => !v)}
                onAskMaven={openMaven}
                kbLoading={kbLoading}
                kbReady={kbReady}
                kbCount={kbCount}
            />
            {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
             {runState === "running" && !kbLoading && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
          </FullBleed>

          {dashboardVisible && runState === 'success' && (
            <>
              <ReportsDashboard 
                  metrics={metrics}
              />
              <ResultsTableCard rows={tableRows} />
            </>
          )}
        </>
      ) : (
        <MavenLayout rows={tableRows} onClose={() => setIsMavenOpen(false)} />
      )}
    </ReportsPageShell>
  );
}
