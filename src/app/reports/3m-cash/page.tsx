"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Luckysheet is loaded dynamically; TS shim:
declare global {
  interface Window {
    luckysheet: any;
  }
}

type SheetMeta = { name: string; index: string };

const NAV_W = "14rem"; // adjust if your left nav width changes

// ---- Excel helpers ----
function colLabel(n: number): string {
  let s = "";
  let x = n;
  while (x >= 0) {
    s = String.fromCharCode((x % 26) + 65) + s;
    x = Math.floor(x / 26) - 1;
  }
  return s;
}
function aoaFromLuckysheetData(lsData: any[][]): (string | number)[][] {
  // Luckysheet's "data" is rows of cells (may be null/undefined).
  return (lsData || []).map((row: any[]) =>
    (row || []).map((cell: any) => (cell && cell.v != null ? cell.v : ""))
  );
}
function getActiveSheetIndex(): number {
  const file = window.luckysheet?.getAllSheets?.();
  if (!file || !file.length) return 0;
  const cur = window.luckysheet?.getSheet?.();
  if (!cur) return 0;
  const idx = file.findIndex((s: any) => s.index === cur.index);
  return Math.max(0, idx);
}

export default function ReportsExcelPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lsLoaded, setLsLoaded] = useState(false);
  const [activeReport, setActiveReport] = useState("3M Cash"); // whatever you select on the left
  const [readme, setReadme] = useState(
    "### README\n\nDescribe the Python scripts you’ll run on this dataset. Include parameter notes, expected outputs, and data constraints here."
  );

  // Dark palette (jet/graphite/steel).
  const styles = {
    bg: "#000000",
    card: "#0d0d10",
    cardRaised: "#141418",
    cardHeader: "#1b1c21",
    text: "#c7ccd4",
    textMuted: "#8f97a3",
    white: "#ffffff",
    border: "rgba(199,204,212,0.10)",
    ring: "rgba(199,204,212,0.18)",
  };

  // Init Luckysheet once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (typeof window === "undefined") return;
      // Dynamic import via ESM build
      await import("luckysheet"); // exposes window.luckysheet
      if (cancelled) return;

      // Create a clean, blank workbook
      window.luckysheet?.destroy?.();

      window.luckysheet.create({
        container: containerRef.current?.id ?? "luckysheet",
        lang: "en",
        // Excel-like layout but minimalist
        showtoolbar: false,
        showinfobar: false,
        showstatisticBar: false,
        allowEdit: true,
        sheetFormulaBar: false,
        showsheetbar: true,
        showsheetbarConfig: { add: true, menu: true, sheet: true },
        // Make it feel like Excel out of the box
        data: [
          {
            name: "Sheet1",
            data: [], // blank; Luckysheet shows headers/gridlines automatically
          },
        ],
        // Size/position handled by parent flex
      });

      // Apply dark theme overrides after create
      injectLuckysheetDarkCSS(styles);

      setLsLoaded(true);
    }
    load();

    return () => {
      cancelled = true;
      try {
        window.luckysheet?.destroy?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Import Excel/CSV into current workbook (replaces all sheets) ----
  async function onImport(file: File) {
    if (!lsLoaded) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });

    // Build Luckysheet data arrays
    const data = wb.SheetNames.map((name, i) => {
      const ws = wb.Sheets[name];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
      return {
        name: name || `Sheet${i + 1}`,
        data: aoa,
      };
    });

    // Replace the workbook
    window.luckysheet.destroy();
    window.luckysheet.create({
      container: containerRef.current?.id ?? "luckysheet",
      lang: "en",
      showtoolbar: false,
      showinfobar: false,
      showstatisticBar: false,
      allowEdit: true,
      sheetFormulaBar: false,
      showsheetbar: true,
      showsheetbarConfig: { add: true, menu: true, sheet: true },
      data,
    });
    injectLuckysheetDarkCSS(styles);
  }

  // ---- Export current sheet as CSV or XLSX ----
  function exportActive(as: "csv" | "xlsx") {
    const file = window.luckysheet?.getAllSheets?.();
    if (!file || !file.length) return;
    const idx = getActiveSheetIndex();
    const sheet = file[idx];
    // Luckysheet builds two structures; we prefer .data (AOA-ish)
    const aoa = aoaFromLuckysheetData(sheet.data);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Sheet1");

    if (as === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${activeReport}_${sheet.name || "Sheet1"}.csv`);
    } else {
      XLSX.writeFile(wb, `${activeReport}_${sheet.name || "Sheet1"}.xlsx`);
    }
  }

  // ---- File input helper ----
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="min-h-screen"
      style={{ background: styles.bg, color: styles.text }}
    >
      {/* Top bar (your product nav lives above this page area) */}

      {/* Main content grid: left scripts, right editor */}
      <div className="pt-4" style={{ paddingLeft: "1rem" }}>
        <div className="mx-auto max-w-[1400px] px-4 space-y-6">

          {/* Excel Pane (header + canvas + bottom tabs live in luckysheet) */}
          <section
            className="rounded-xl border overflow-hidden flex flex-col"
            style={{
              height: "72vh",                 // feel free to use a CSS var
              background: styles.card,
              borderColor: styles.border,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b"
              style={{ borderColor: styles.border, background: styles.cardHeader }}
            >
              <div className="flex items-center gap-3">
                <h2 style={{ color: styles.white }} className="text-sm font-semibold">
                  {activeReport}
                </h2>
                <span className="text-xs" style={{ color: styles.textMuted }}>
                  Excel-style canvas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) await onImport(f);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: styles.cardRaised,
                    color: styles.text,
                    border: `1px solid ${styles.border}`,
                  }}
                >
                  <Upload size={16} /> Import Excel/CSV
                </button>
                <button
                  onClick={() => exportActive("csv")}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: styles.cardRaised,
                    color: styles.text,
                    border: `1px solid ${styles.border}`,
                  }}
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => exportActive("xlsx")}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: styles.cardRaised,
                    color: styles.text,
                    border: `1px solid ${styles.border}`,
                  }}
                >
                  <Download size={16} /> Export XLSX
                </button>
              </div>
            </div>

            {/* Luckysheet canvas */}
            <div className="flex-1 overflow-hidden">
              <div id="luckysheet" ref={containerRef} className="h-full w-full" />
            </div>
          </section>

          {/* README pane (fixed height) */}
          <section
            className="rounded-xl border overflow-auto p-4"
            style={{
              height: "18vh",
              background: styles.card,
              borderColor: styles.border,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                style={{ background: "#acb3bd" }}
                className="h-2 w-2 rounded-full"
              />
              <h3 className="text-sm font-semibold" style={{ color: styles.white }}>
                README
              </h3>
              <span className="text-xs" style={{ color: styles.textMuted }}>
                (Describe scripts, inputs, and outputs)
              </span>
            </div>
            <textarea
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              className="w-full h-[calc(18vh-3rem)] resize-none rounded-lg p-3 outline-none"
              style={{
                background: styles.cardRaised,
                color: styles.text,
                border: `1px solid ${styles.border}`,
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

/** Inject dark overrides to Luckysheet to match jet/graphite/steel */
function injectLuckysheetDarkCSS(s: {
  bg: string; card: string; cardRaised: string; cardHeader: string;
  text: string; textMuted: string; white: string; border: string; ring: string;
}) {
  const id = "ls-dark-overrides";
  if (document.getElementById(id)) return;
  const css = `
  /* Root canvas */
  #luckysheet, .luckysheet, .luckysheet-cell-main {
    background: ${s.card} !important;
    color: ${s.text} !important;
  }
  /* Grid header rows/cols */
  .luckysheet-cols-h-c, .luckysheet-rows-h {
    background: ${s.cardHeader} !important;
    color: ${s.text} !important;
    border-color: ${s.border} !important;
  }
  .luckysheet-col-header, .luckysheet-row-header, .luckysheet-cs-inner {
    background: ${s.cardHeader} !important;
    color: ${s.text} !important;
  }
  /* Gridlines and borders */
  .luckysheet-cell-main .luckysheet-grid-window-1, 
  .luckysheet-cell-main .luckysheet-grid-window-2,
  .luckysheet-cell-main .luckysheet-grid-window-3 {
    border-color: ${s.border} !important;
  }
  .luckysheet-cell-main td, .luckysheet-cell-main th {
    border-color: ${s.border} !important;
  }
  /* Active selection */
  .luckysheet-selection-copy, .luckysheet-selection {
    border-color: ${s.white} !important;
  }
  /* Sheet tab bar (bottom) */
  .luckysheet-sheet-area, .luckysheet-sheets-item, .luckysheet-sheets-item:hover {
    background: ${s.cardHeader} !important;
    color: ${s.text} !important;
    border-color: ${s.border} !important;
  }
  .luckysheet-sheets-item-active {
    background: ${s.cardRaised} !important;
    color: ${s.white} !important;
    border-color: ${s.border} !important;
  }
  /* Hide toolbar/formula bar */
  .luckysheet-toolbar, .luckysheet-wa-editor, .luckysheet-wa-calc-workbook {
    display: none !important;
  }
  /* Context menus / popups */
  .luckysheet-env { background: ${s.cardRaised} !important; color: ${s.text} !important; }
  .luckysheet-cols-menu, .luckysheet-mousedown-cancel2 {
    background: ${s.cardRaised} !important; color: ${s.text} !important; border-color: ${s.border} !important;
  }
  /* Scrollbars (webkit) */
  #luckysheet::-webkit-scrollbar, .luckysheet-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
  #luckysheet::-webkit-scrollbar-thumb, .luckysheet-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
  `;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}
