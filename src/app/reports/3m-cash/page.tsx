
"use client";

import React from "react";
import PurposeCard from "@/components/PurposeCard";
import UploadCard from "@/components/UploadCard";
import { ThreeMCashDashboard } from "@/components/dashboard/ThreeMCashDashboard";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";

type UploadKey = "pycash_1" | "pycash_2" | "pypi";

export default function ReportsExcelPage() {
  const [files, setFiles] = React.useState<Record<UploadKey, File | null>>({
    pycash_1: null,
    pycash_2: null,
    pypi: null,
  });
  const [ok, setOk] = React.useState<Record<UploadKey, boolean>>({
    pycash_1: false,
    pycash_2: false,
    pypi: false,
  });

  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any[] | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const allReady = ok.pycash_1 && ok.pycash_2 && ok.pypi;

  function accept(key: UploadKey, f: File) {
    setFiles((s) => ({ ...s, [key]: f }));
    setOk((s) => ({ ...s, [key]: true }));
  }

  async function runMergeJSON() {
    if (!allReady) return;
    setIsRunning(true);
    setError(null);
    setShowDash(false);
    try {
      const fd = new FormData();
      fd.append("pycash_1", files.pycash_1!);
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
      fd.append("pycash_1", files.pycash_1!);
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
            <PurposeCard>
              <h2 className="text-xl font-bold mb-2">Purpose</h2>
              <p>
                This report analyzes all <strong>managed</strong> client accounts and isolates{" "}
                <strong>advisor-directed</strong> accounts to determine how much{" "}
                <strong>cash</strong> should be reserved to cover{" "}
                <strong>advisory fees</strong> for the next{" "}
                <strong>3</strong> and <strong>6 months</strong>.
              </p>
            </PurposeCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UploadCard title="Report ID: PYCASH" onFileAccepted={(f) => accept("pycash_1", f)} />
              <UploadCard title="Report ID: PYCASH" onFileAccepted={(f) => accept("pycash_2", f)} />
              <UploadCard title="Report ID: PYPI" onFileAccepted={(f) => accept("pypi", f)} />
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
