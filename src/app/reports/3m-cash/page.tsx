
"use client";

import React from "react";
import PurposeCard from "@/components/PurposeCard";
import UploadCard from "@/components/UploadCard";
import { ThreeMCashDashboard } from "@/components/dashboard/ThreeMCashDashboard";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";

type UploadKey = "pyfee" | "pycash_2" | "pypi";

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
            <PurposeCard>
              <h2 className="text-xl font-bold mb-2">Report Summary</h2>
              <p>
                This report analyzes all <strong>managed</strong> client accounts and isolates{" "}
                <strong>advisor-directed</strong> accounts to determine how much{" "}
                <strong>cash</strong> should be reserved to cover{" "}
                <strong>advisory fees</strong> for the next{" "}
                <strong>3</strong> and <strong>6 months</strong>.
              </p>
            </PurposeCard>

            <PurposeCard>
                <h2 className="text-xl font-bold text-zinc-100 mb-3">Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                    <li>
                    In Report Center, run <span className="font-semibold text-zinc-100">report ID PYFEE</span>. 
                    Download it and upload to the <span className="font-semibold">first</span> box.
                    </li>
                    <li>
                    In Report Center, run <span className="font-semibold text-zinc-100">report ID PYCASH</span>. 
                    Download it and upload to the <span className="font-semibold">second</span> box.
                    </li>
                    <li>
                    Run <span className="font-semibold text-zinc-100">report ID PYPI</span>. 
                    Download it and upload to the <span className="font-semibold">third</span> box.
                    </li>
                </ol>
                <div className="mt-4 rounded-xl border border-[#26272b] bg-[#0b0b0b] p-3">
                    <p className="text-sm text-zinc-400">
                    <span className="font-semibold text-zinc-200">Excel tip:</span> After opening a downloaded file in Excel, 
                    click <span className="font-semibold">Enable Editing</span>, then save before uploading.
                    </p>
                </div>
            </PurposeCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UploadCard title="REPORT ID: PYFEE" reportId="PYFEE" onFileAccepted={(f) => accept("pyfee", f)} />
              <UploadCard title="REPORT ID: PYCASH" reportId="PYCASH" onFileAccepted={(f) => accept("pycash_2", f)} />
              <UploadCard title="REPORT ID: PYPI" reportId="PYPI" onFileAccepted={(f) => accept("pypi", f)} />
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
