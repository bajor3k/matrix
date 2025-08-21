
"use client";

import React from "react";
import UploadCard from "@/components/UploadCard";
import { cn } from "@/lib/utils";
import Script from "next/script";

type Key = "a" | "b" | "c";

type Props = {
  /** Page title shown in the browser tab if you want, but mainly for clarity */
  reportName: string;
  /** Summary markdown/text – pass "" to keep blank body */
  summary?: string;
  /** Instructions markdown/text – pass "" to keep blank body */
  instructions?: string;
  /** API path to call when running (we’ll wire later), e.g. /api/reports/cash-balance/merge */
  mergeApiPath?: string;
  /** Optional array of three report IDs for the upload cards */
  reportIds?: [string, string, string];
};

export default function ReportScaffold({
  reportName,
  summary = "",
  instructions = "",
  mergeApiPath = "/api/reports/TBD/merge",
  reportIds = ["—", "—", "—"],
}: Props) {
  const [files, setFiles] = React.useState<Record<Key, File | null>>({
    a: null, b: null, c: null,
  });
  const [ok, setOk] = React.useState<Record<Key, boolean>>({
    a: false, b: false, c: false,
  });
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any[] | null>(null);
  const [showDash, setShowDash] = React.useState(false);

  const allReady = ok.a && ok.b && ok.c;

  function accept(key: Key, f: File) {
    setFiles((s) => ({ ...s, [key]: f }));
    setOk((s) => ({ ...s, [key]: true }));
  }

  async function runMergeJSON() {
    if (!allReady) return;
    setIsRunning(true); setError(null); setShowDash(false);
    try {
      const fd = new FormData();
      fd.append("fileA", files.a!);
      fd.append("fileB", files.b!);
      fd.append("fileC", files.c!);
      const res = await fetch(`${mergeApiPath}?format=json`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setData(rows);
      if (window.TEST_APP) {
        window.TEST_APP.rows = rows;
      }
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
    } finally {
      setIsRunning(false);
    }
  }

  async function downloadExcel() {
    if (!allReady) return;
    const fd = new FormData();
    fd.append("fileA", files.a!);
    fd.append("fileB", files.b!);
    fd.append("fileC", files.c!);
    const res = await fetch(`${mergeApiPath}?format=xlsx`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reportName.replace(/\s+/g, "_").toLowerCase()}_merged.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  
  const handleOpenDashboard = () => {
    if (window.openTestDashboard) {
        window.openTestDashboard();
    }
    setShowDash(true);
  }

  const handleHideDashboard = () => {
      if (window.hideTestDashboard) {
          window.hideTestDashboard();
      }
      setShowDash(false);
  }


  return (
    <>
    <div className="space-y-6 p-4">
      {/* Report Summary */}
      <div className="rounded-2xl p-6 shadow-sm border border-[#26272b] bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Report Summary</h2>
        {summary ? (
          <div className="text-zinc-300">{summary}</div>
        ) : (
          <div className="text-zinc-500 italic">—</div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl p-6 shadow-sm border border-[#26272b] bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Instructions</h2>
        {instructions ? (
          <div className="text-zinc-300">{instructions}</div>
        ) : (
          <div className="text-zinc-500 italic">—</div>
        )}
      </div>

      {/* Upload cards with blank IDs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadCard title="REPORT ID:" reportId={reportIds[0]} onFileAccepted={(f)=>accept("a",f)} />
        <UploadCard title="REPORT ID:" reportId={reportIds[1]} onFileAccepted={(f)=>accept("b",f)} />
        <UploadCard title="REPORT ID:" reportId={reportIds[2]} onFileAccepted={(f)=>accept("c",f)} />
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          onClick={runMergeJSON}
          disabled={!allReady || isRunning}
          className={cn(
            "rounded-2xl px-5 py-3 text-sm font-semibold transition shadow-sm",
            allReady && !isRunning ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                                   : "bg-[#2f3136] text-zinc-400 cursor-not-allowed"
          )}
        >
          {isRunning ? "Running…" : "Run Report"}
        </button>

        <div className="flex gap-3">
          <button
            onClick={downloadExcel}
            disabled={!data || isRunning}
            className={cn(
              "rounded-xl px-4 py-2 text-sm transition border border-[#26272b]",
              !data ? "bg-[#1a1b1f] text-zinc-500 cursor-not-allowed"
                    : "bg-[#0f0f13] text-zinc-200 hover:bg-[#16171c]"
            )}
          >
            Download Excel
          </button>
          <button
            onClick={showDash ? handleHideDashboard : handleOpenDashboard}
            disabled={!data || isRunning}
            className={cn(
              "rounded-xl px-4 py-2 text-sm transition border border-[#26272b]",
              !data ? "bg-[#1a1b1f] text-zinc-500 cursor-not-allowed"
                    : "bg-[#0f0f13] text-zinc-200 hover:bg-[#16171c]"
            )}
          >
            {showDash ? "Hide Dashboard" : "Open Dashboard"}
          </button>
        </div>

        {error && <div className="text-xs text-rose-400">{error}</div>}
      </div>

      <div id="test-dashboard" className="test-dashboard" hidden></div>
    </div>
    <Script id="test-dashboard-script">
        {`
            /* ----------------- GLOBAL STATE FOR TEST PAGE ----------------- */
            window.TEST_APP = window.TEST_APP || { rows: null };

            /* ------------- CAPTURE UPLOADS FROM YOUR THREE CARDS ---------- */
            const handleUpload = (e) => {
                window.TEST_APP.rows = e.detail.rows;
                console.log('[TEST] captured rows:', window.TEST_APP.rows?.length ?? 0);
            };

            window.removeEventListener('upload:parsed', handleUpload);
            window.addEventListener('upload:parsed', handleUpload);


            /* ------------------------ HELPERS ----------------------------- */
            function money(n){
              const x = Number(n);
              if (!isFinite(x)) return '';
              return x.toLocaleString(undefined, { style:'currency', currency:'USD', maximumFractionDigits: 2 });
            }
            function num(v){
              if (v === null || v === undefined) return null;
              const n = Number(String(v).replace(/[, ]/g,''));
              return isFinite(n) ? n : null;
            }

            /* --------- MODEL BUILDER (maps your exact columns) ------------ */
            function buildTestModel(){
              const rows = window.TEST_APP.rows;
              if (!rows || rows.length === 0) return null;

              const COL_IP   = 'IP';
              const COL_ACCT = 'Account Number';
              const COL_VAL  = 'Value';
              const COL_FEE  = 'Advisory Fees';
              const COL_CASH = 'Cash';

              const view = rows.map(r => {
                const ip   = r[COL_IP] ?? '';
                const acct = r[COL_ACCT] ?? '';
                const val  = num(r[COL_VAL]);
                const fee  = num(r[COL_FEE]);
                const cash = num(r[COL_CASH]);
                const short = (fee != null && cash != null) ? (cash < fee) : false;
                return { ip, acct, val, fee, cash, short };
              });

              const kpis = {
                totalFee: view.reduce((s, r) => s + (r.fee || 0), 0),
                accounts: view.filter(r => String(r.acct || '').trim().length > 0).length,
                shortCount: view.filter(r => r.short).length
              };

              const byIP = {};
              view.forEach(r => { byIP[r.ip || '(Unspecified)'] = (byIP[r.ip || '(Unspecified)'] || 0) + (r.fee || 0); });
              const donut = { labels: Object.keys(byIP), values: Object.values(byIP) };

              return { rows: view, kpis, donut };
            }

            /* ----------------------- RENDERER ----------------------------- */
            function renderTestDashboard(){
              const host = document.getElementById('test-dashboard');
              if (!host) return;
              host.hidden = false;
              host.innerHTML = '';

              const model = buildTestModel();
              if (!model){
                host.innerHTML = '<div style="color:#9aa0b4;">No data found. Upload a spreadsheet with columns <b>IP</b>, <b>Account Number</b>, <b>Value</b>, <b>Advisory Fees</b>, <b>Cash</b>.</div>';
                return;
              }

              const kpisEl = document.createElement('div');
              kpisEl.className = 'test-kpis';
              kpisEl.innerHTML = \`
                <div class="test-kpi">
                  <div class="label">Total Advisory Fees</div>
                  <div class="value">\${money(model.kpis.totalFee)}</div>
                </div>
                <div class="test-kpi">
                  <div class="label">Total Accounts</div>
                  <div class="value">\${model.kpis.accounts.toLocaleString()}</div>
                </div>
                <div class="test-kpi">
                  <div class="label">Flagged Short</div>
                  <div class="value">\${model.kpis.shortCount.toLocaleString()}</div>
                </div>
              \`;
              host.appendChild(kpisEl);

              const grid = document.createElement('div');
              grid.className = 'test-grid';
              host.appendChild(grid);

              const chartDiv = document.createElement('div');
              chartDiv.id = 'test-donut';
              chartDiv.style.height = '420px';
              grid.appendChild(chartDiv);

              if (window.Plotly) {
                Plotly.newPlot(
                  chartDiv,
                  [{ type:'pie', labels: model.donut.labels, values: model.donut.values, hole:0.55, textinfo:'label+percent', sort:false }],
                  { title:'Advisory Fees by IP', paper_bgcolor:'#11111a', plot_bgcolor:'#11111a', font:{color:'#e6e6f0'}, margin:{l:20,r:20,t:40,b:20}, showlegend:true },
                  { displayModeBar:false, responsive:true }
                );
              }

              const tableWrap = document.createElement('div');
              tableWrap.className = 'test-table';
              tableWrap.innerHTML = \`
                <table>
                  <thead>
                    <tr>
                      <th>IP</th>
                      <th>Account Number</th>
                      <th>Value</th>
                      <th>Advisory Fees</th>
                      <th>Cash</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              \`;
              grid.appendChild(tableWrap);

              const tbody = tableWrap.querySelector('tbody');
              model.rows.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                  <td>\${r.ip || ''}</td>
                  <td>\${r.acct || ''}</td>
                  <td>\${r.val != null ? money(r.val) : ''}</td>
                  <td>\${r.fee != null ? money(r.fee) : ''}</td>
                  <td>\${r.cash != null ? money(r.cash) : ''}</td>
                  <td>\${r.short ? '<span class="pill-short">Short</span>' : ''}</td>
                \`;
                tbody.appendChild(tr);
              });
            }

            /* ---------- BUTTON HOOKS (Open / Hide dashboard) ---------- */
            window.openTestDashboard = function(){
              renderTestDashboard();
              const host = document.getElementById('test-dashboard');
              if (host) host.scrollIntoView({ behavior:'smooth', block:'start' });
            };
            window.hideTestDashboard = function(){
              const host = document.getElementById('test-dashboard');
              if (host) host.hidden = true;
            };
        `}
    </Script>
    </>
  );
}

// Extend the Window interface for TypeScript
declare global {
    interface Window {
        TEST_APP: {
            rows: any[] | null;
        };
        openTestDashboard: () => void;
        hideTestDashboard: () => void;
        Plotly: any;
    }
}
