
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import { ThreeMCashDashboard } from "@/components/dashboard/ThreeMCashDashboard";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";

type UploadKey = "pyfee" | "pycash_2" | "pypi";

const REPORT_SUMMARY =
  "This report analyzes all managed client accounts and isolates advisor-directed accounts to determine how much cash should be reserved to cover advisory fees for the next 3 and 6 months. It takes into account periodic instructions for each account, and lets you know the available cash and MMF for each account.";

const INSTRUCTIONS: string[] = [
  "In Report Center, run Report ID: PYFEE. Download it and upload to the first box.",
  "In Report Center, run Report ID PYCASH. Download it and upload to the second box.",
  "In Report Center, run Report ID PYPI. Download it and upload to the third box.",
];

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
  const [data, setData] = React.useState<any[] | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const allReady = ok.pyfee && ok.pycash_2 && ok.pypi;

  function accept(key: UploadKey, f: File | null) {
    setFiles((s) => ({ ...s, [key]: f }));
    setOk((s) => ({ ...s, [key]: !!f }));
  }

  async function runMergeJSON() {
    if (!allReady) return;
    setIsRunning(true);
    setError(null);
    setShowDash(false);
    try {
      const fd = new FormData();
      fd.append("pycash_1", files.pyfee!);
      fd.append("pycash_2", files.pycash_2!);
      fd.append("pypi", files.pypi!);
      const res = await fetch("/api/reports/3m-cash/merge?format=json", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setData(rows);
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

  return (
    <div className="p-4">
      <main className="app-main fullbleed">
        <div className="content-pad">
          <div className="space-y-6">
            <div className="rounded-2xl p-6 shadow-sm border border-[#26272b] bg-[#0a0a0a]">
              <h2 className="text-xl font-bold mb-2">Report Summary</h2>
              <p className="text-white/80">{REPORT_SUMMARY}</p>
            </div>

            <div className="rounded-2xl p-6 shadow-sm border border-[#26272b] bg-[#0a0a0a]">
                <h2 className="text-xl font-bold text-zinc-100 mb-3">Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 text-white/80">
                  {INSTRUCTIONS.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UploadCard reportId="PYFEE" onFileAccepted={(f) => accept("pyfee", f)} onFileCleared={() => accept("pyfee", null)} slotId="3m-cash-a" />
              <UploadCard reportId="PYCASH" onFileAccepted={(f) => accept("pycash_2", f)} onFileCleared={() => accept("pycash_2", null)} slotId="3m-cash-b" />
              <UploadCard reportId="PYPI" onFileAccepted={(f) => accept("pypi", f)} onFileCleared={() => accept("pypi", null)} slotId="3m-cash-c" />
            </div>

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
                  disabled={!data || isRunning}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm transition border border-[#26272b]",
                    !data ? "bg-[#1a1b1f] text-zinc-500 cursor-not-allowed" : "bg-[#0f0f13] text-zinc-200 hover:bg-[#16171c]"
                  )}
                >
                  Download Excel
                </button>
                <button
                  onClick={() => setShowDash((v) => !v)}
                  disabled={!data || isRunning}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm transition border border-[#26272b]",
                    !data ? "bg-[#1a1b1f] text-zinc-500 cursor-not-allowed" : "bg-[#0f0f13] text-zinc-200 hover:bg-[#16171c]"
                  )}
                >
                  {showDash ? "Hide Dashboard" : "Open Dashboard"}
                </button>
              </div>

              {error && <div className="text-xs text-rose-400">{error}</div>}
            </div>

            {showDash && data && <ThreeMCashDashboard data={data} />}
          </div>
        </div>
      </main>
    </div>
  );
}
