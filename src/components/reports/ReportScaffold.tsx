"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import type { TableRow } from "./ResultsTableCard";
import ReportsPageShell from "./ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "./HelpHeader";
import { UploadRow } from "./UploadRow";
import FullBleed from "../layout/FullBleed";
import ActionsRow from "./ActionsRow";
import { saveAs } from "file-saver";
import ResultsTableCard from "./ResultsTableCard";
import { MavenLayout } from "./maven/MavenLayout";
import KeyMetricsPanel from "./KeyMetricsPanel";
import ReportWorkspace from "./ReportWorkspace";
import { MavenChat } from "./maven/MavenChat";
import { FLAGS } from "@/lib/featureFlags";

type Props = {
  reportName: string;
  summary?: string | React.ReactNode;
  instructions?: React.ReactNode;
  mergeApiPath?: string;
  requiredFileCount?: 1 | 2 | 3;
  fileLabels?: string[];
};

interface DashboardMetrics {
    totalAdvisoryFees: number;
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
  fileLabels,
}: Props) {
  const [files, setFiles] = React.useState<(File | null)[]>([null, null, null]);
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<"maven" | "key-metrics">("maven");
  const [isMavenOpen, setIsMavenOpen] = React.useState(true);

  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);

  const filesReady = files.slice(0, requiredFileCount).every(Boolean);
  const canOpenMaven = runState === 'success';

  React.useEffect(() => {
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
      const advisoryFee = num(r['Advisory Fees']) ?? 0;
      return {
        ip: r['IP'] ?? '',
        acct: r['Account Number'] ?? '',
        value: money(r['Value']),
        fee: money(advisoryFee),
        cash: money(r['Cash']),
        short: (num(r['Cash']) ?? 0) < advisoryFee,
      };
    });
    
    setTableRows(rows);
  }

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
      setActiveView("maven"); // Default to maven workspace on success
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
        
        {FLAGS.showReportUploadCards && (
          <FullBleed>
              <UploadRow>
                {Array.from({ length: requiredFileCount }).map((_, index) => (
                  <UploadCard
                    key={index}
                    file={files[index]}
                    onFileChange={handleFileChange(index)}
                    dropzoneText={fileLabels?.[index] ?? `Drop File ${index + 1} here`}
                  />
                ))}
              </UploadRow>
          </FullBleed>
        )}
        
        <FullBleed>
            <ActionsRow
            filesReady={filesReady}
            runState={runState}
            activeView={activeView}
            onRun={runReport}
            onDownloadExcel={downloadExcel}
            onToggleKeyMetrics={() => setActiveView(p => p === 'key-metrics' ? 'maven' : 'key-metrics')}
            onToggleMaven={() => setIsMavenOpen(v => !v)}
            isMavenOpen={isMavenOpen}
            canOpenMaven={canOpenMaven}
            />
            {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
            {runState === 'running' && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
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