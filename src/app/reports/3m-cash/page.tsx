// src/app/reports/3m-cash/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import HelpHeader, { helpHeaderAutoDismiss } from "@/components/reports/HelpHeader";
import { UploadRow } from "@/components/reports/UploadRow";
import type { TableRow } from "@/components/reports/ResultsTableCard";
import FullBleed from "@/components/layout/FullBleed";
import { saveAs } from "file-saver";
import ActionsRow from "@/components/reports/ActionsRow";
import UploadCard from "@/components/UploadCard";
import ResultsTableCard from "@/components/reports/ResultsTableCard";
import { MavenLayout } from "@/components/reports/maven/MavenLayout";
import { indexMergedRows } from '@/lib/askmaven/kb';
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import KeyMetricsPanel from "@/components/reports/KeyMetricsPanel";
import ReportWorkspace from "@/components/reports/ReportWorkspace";
import { MavenChat } from "@/components/reports/maven/MavenChat";


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

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  const [error, setError] = React.useState<string | null>(null);
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [activeView, setActiveView] = React.useState<"maven" | "key-metrics">("maven");
  const [isMavenOpen, setIsMavenOpen] = React.useState(true); // Default to open in workspace

  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);
  const [kbLoading, setKbLoading] = React.useState(false);

  const filesReady = files.filter(Boolean).length === 3;
  
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
      setTableRows([]);
      return;
    }

    const rows: TableRow[] = data.map(r => {
      const advisoryFee = num(r['Advisory Fee']) ?? 0;
      return {
          ip: r['IP'] ?? '',
          acct: r['Account'] ?? '',
          value: money(r['Value']),
          fee: money(advisoryFee),
          cash: money(r['Cash']),
          short: (num(r['Cash']) ?? 0) < advisoryFee,
      }
    });

    setTableRows(rows);
  }

  async function runReport() {
    if (!filesReady) return;
    setRunState("running");
    setError(null);
    setKbLoading(false); // Reset on new run

    try {
      const fd = new FormData();
      fd.append("pycash_1", files[0]!);
      fd.append("pycash_2", files[1]!);
      fd.append("pypi", files[2]!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const mergedRows = await res.json();
      
      processApiData(mergedRows);
      setRunState("success");
      setActiveView("maven"); // Default to maven view on success
      setIsMavenOpen(true);

      setKbLoading(true);
      try {
        const { count } = await indexMergedRows(mergedRows);
        console.log('[AskMaven] indexed', count, 'rows');
      } catch(e) {
        console.error('[AskMaven] indexing failed', e);
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
                runState={runState}
                activeView={activeView}
                onRun={runReport}
                onDownloadExcel={downloadExcel}
                onToggleKeyMetrics={() => setActiveView(prev => prev === 'key-metrics' ? 'maven' : 'key-metrics')}
                kbLoading={kbLoading}
            />
            {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
            {runState === "running" && !kbLoading && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
            {runState === "success" && kbLoading && <div className="text-center text-xs text-muted-foreground mt-2">Indexing knowledge base...</div>}
        </FullBleed>

        {runState === 'success' && (
          <ReportWorkspace
            isMavenOpen={isMavenOpen}
            setIsMavenOpen={setIsMavenOpen}
            left={
              activeView === 'key-metrics' 
                ? <KeyMetricsPanel rows={tableRows} /> 
                : <ResultsTableCard rows={tableRows} />
            }
            right={<MavenChat onClose={() => setIsMavenOpen(false)} />}
          />
        )}
    </ReportsPageShell>
  );
}
