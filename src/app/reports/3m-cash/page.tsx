
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { README_CONTENT_3M_CASH } from "./readme-content";
import ReadmeCard from "@/components/ReadmeCard";


// Luckysheet is loaded dynamically; TS shim:
declare global {
  interface Window {
    luckysheet: any;
  }
}

// Any report in this set will render README-only
const README_ONLY = new Set(["3M Cash", "3M Cache"]);

type SheetMeta = { name: string; index: string };

// ---- Excel helpers ----
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
    shadow: "0 10px 30px rgba(0,0,0,0.35)",
  };

  const isReadmeOnly = README_ONLY.has(activeReport);

  // Tear down Luckysheet if we're on a README-only report
  useEffect(() => {
    if (!isReadmeOnly) return;
    try {
      (window as any).luckysheet?.destroy?.();
    } catch {}
  }, [isReadmeOnly]);


  // Init Luckysheet once on mount
  useEffect(() => {
    if (isReadmeOnly) return; // don't init on 3M Cash

    let cancelled = false;

    function load() {
      // Check for both the object and its create method. Retry if not ready.
      if (typeof window === "undefined" || !window.luckysheet?.create) {
        setTimeout(load, 100);
        return;
      }
      
      if (cancelled) return;

      // Create a clean, blank workbook
      try {
        window.luckysheet.destroy();
      } catch (e) {
        console.warn("Luckysheet destroy failed (might be first load):", e);
      }
      
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
  }, [isReadmeOnly]);

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

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await onImport(f);
    if (fileRef.current) fileRef.current.value = "";
  };
  
  // This effect runs once on component mount to wire up the upload cards.
  useEffect(() => {
    if (!isReadmeOnly) return;
    
    const UPLOAD_SLOTS = [
      { id: 'cash-upload-a', title: 'Report ID: PYCASH' },
      { id: 'cash-upload-b', title: 'Report ID: PYCASH' },
      { id: 'cash-upload-c', title: 'Report ID: PYPI' },
    ];
    const FILE_LIMIT_MB = 10;
    const ALLOWED = ['xlsx', 'xls', 'csv'];

    const templateId = 'upload-card-template';
    if (!document.getElementById(templateId)) {
        const templateEl = document.createElement('template');
        templateEl.id = templateId;
        templateEl.innerHTML = `
            <div class="upload-inner">
                <div class="upload-header">
                    <div class="upload-title">Upload</div>
                    <div class="upload-sub">Drop an Excel/CSV file or click to browse.</div>
                </div>
                <label class="dropzone">
                    <input type="file" class="file-input" accept=".xlsx,.xls,.csv" hidden />
                    <div class="dropzone-body">
                    <div class="drop-icon">⬆️</div>
                    <div class="drop-title">Drag & drop here</div>
                    <div class="drop-sub">or <span class="browse">browse</span> from your computer</div>
                    <div class="drop-note">Max 10MB • .xlsx / .xls / .csv</div>
                    </div>
                </label>
                <div class="file-info" hidden>
                    <div class="file-row">
                    <span class="file-name">—</span>
                    <span class="file-size">—</span>
                    </div>
                    <div class="file-status ok" hidden>Parsed successfully.</div>
                    <div class="file-status err" hidden></div>
                </div>
                <div class="preview" hidden>
                    <div class="preview-title">Preview (first 10 rows)</div>
                    <div class="preview-table-wrap">
                    <table class="preview-table">
                        <thead></thead>
                        <tbody></tbody>
                    </table>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(templateEl);
    }


    function formatBytes(bytes: number) {
      if (!bytes) return "0 Bytes";
      const mb = bytes / (1024 * 1024);
      return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
    }

    function renderPreview(container: HTMLElement, columns: string[], rows: any[]) {
      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      if (!thead || !tbody) return;

      thead.innerHTML = '';
      tbody.innerHTML = '';

      const trh = document.createElement('tr');
      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trh.appendChild(th);
      });
      thead.appendChild(trh);

      rows.slice(0, 10).forEach(r => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          td.textContent = r[col] ?? '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    function parseFile(file: File, onDone: (data: { rows: any[]; columns: string[] }) => void, onError: (message: string) => void) {
      if (typeof XLSX === 'undefined') {
        onError('File parsing library (SheetJS) is not loaded.');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => onError('Failed to read file.');
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const first = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(first, { defval: '' });
          const columns = Object.keys(json[0] || {});
          onDone({ rows: json, columns });
        } catch (e) {
          onError('Could not parse spreadsheet.');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function makeUploader(slot: {id: string, title: string}) {
      const host = document.getElementById(slot.id);
      if (!host) return; 
      
      const tpl = document.getElementById(templateId) as HTMLTemplateElement;
      if (!tpl) return;
      
      host.innerHTML = '';
      
      const node = tpl.content.cloneNode(true) as DocumentFragment;

      (node.querySelector('.upload-title') as HTMLElement).textContent = slot.title;

      const dropzone = node.querySelector('.dropzone') as HTMLLabelElement;
      const input = node.querySelector('.file-input') as HTMLInputElement;
      const info = node.querySelector('.file-info') as HTMLDivElement;
      const nameEl = node.querySelector('.file-name') as HTMLSpanElement;
      const sizeEl = node.querySelector('.file-size') as HTMLSpanElement;
      const okEl = node.querySelector('.file-status.ok') as HTMLDivElement;
      const errEl = node.querySelector('.file-status.err') as HTMLDivElement;
      const previewWrap = node.querySelector('.preview') as HTMLDivElement;
      const table = node.querySelector('.preview-table') as HTMLTableElement;

      const showError = (msg: string) => {
        info.hidden = false;
        okEl.hidden = true;
        errEl.hidden = false;
        errEl.textContent = msg;
        previewWrap.hidden = true;
      };

      const handleFile = (file: File) => {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED.includes(ext)) {
          showError('Unsupported file type. Please upload .xlsx, .xls, or .csv');
          return;
        }
        if (file.size > FILE_LIMIT_MB * 1024 * 1024) {
          showError(`File too large. Max ${FILE_LIMIT_MB}MB`);
          return;
        }

        info.hidden = false;
        okEl.hidden = true;
        errEl.hidden = true;
        nameEl.textContent = file.name;
        sizeEl.textContent = formatBytes(file.size);

        parseFile(file, ({ rows, columns }) => {
          okEl.hidden = false;
          window.dispatchEvent(new CustomEvent('upload:parsed', {
            detail: { slotId: slot.id, file, rows, columns }
          }));
        }, (msg) => {
          showError(msg);
        });
      };

      dropzone.addEventListener('click', () => input.click());
      input.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFile(file);
        (e.target as HTMLInputElement).value = '';
      });

      ['dragenter', 'dragover'].forEach(evt =>
        dropzone.addEventListener(evt, (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('is-drag'); })
      );
      ;['dragleave', 'drop'].forEach(evt =>
        dropzone.addEventListener(evt, (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.remove('is-drag'); })
      );
      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
      });

      host.appendChild(node);
    }

    if (isReadmeOnly) {
        UPLOAD_SLOTS.forEach(makeUploader);
    }

    const onUploadParsed = (e: Event) => {
      console.log('Parsed upload:', (e as CustomEvent).detail);
    };
    
    window.addEventListener('upload:parsed', onUploadParsed);

    return () => {
      window.removeEventListener('upload:parsed', onUploadParsed);
      const templateEl = document.getElementById(templateId);
    };
  }, [isReadmeOnly]);

  return (
    <div className="p-4">
        {isReadmeOnly ? (
          <main className="app-main fullbleed">
            <div className="content-pad">
              <div className="space-y-6">
                <ReadmeCard markdown={README_CONTENT_3M_CASH} />
                <div className="cash-upload-wrap">
                    <section id="cash-upload-section" className="cash-upload-grid">
                      <div id="cash-upload-a" className="upload-card"></div>
                      <div id="cash-upload-b" className="upload-card"></div>
                      <div id="cash-upload-c" className="upload-card"></div>
                    </section>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <>
            <section
              className="rounded-xl border overflow-hidden flex flex-col"
              style={{
                height: "72vh",
                background: styles.card,
                borderColor: styles.border,
              }}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: styles.border, background: styles.cardHeader }}>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold" style={{ color: styles.white }}>
                    {activeReport}
                  </h2>
                  <span className="text-xs" style={{ color: styles.textMuted }}>
                    Excel-style canvas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportChange} />
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                    style={{ background: styles.cardRaised, color: styles.text, border: `1px solid ${styles.border}` }}>
                    <Upload size={16} /> Import Excel/CSV
                  </button>
                  <button onClick={() => exportActive("csv")} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                    style={{ background: styles.cardRaised, color: styles.text, border: `1px solid ${styles.border}` }}>
                    <Download size={16} /> Export CSV
                  </button>
                  <button onClick={() => exportActive("xlsx")} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                    style={{ background: styles.cardRaised, color: styles.text, border: `1px solid ${styles.border}` }}>
                    <Download size={16} /> Export XLSX
                  </button>
                </div>
              </div>

              <div className="h-[calc(72vh-44px)] overflow-hidden">
                <div id="luckysheet" ref={containerRef} className="h-full w-full" />
              </div>
            </section>

            <section
              aria-labelledby="readme-heading"
              className="rounded-xl border overflow-hidden mt-4"
              style={{
                height: "18vh",
                background: styles.card,
                borderColor: styles.border,
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: styles.border, background: styles.card }}
              >
                <h3 id="readme-heading" className="text-sm font-semibold" style={{ color: 'var(--foreground, #ffffff)' }}>
                  README
                </h3>
              </div>

              <div className="w-full h-full" />
            </section>
          </>
        )}
    </div>
  );
}

function injectLuckysheetDarkCSS(s: {
  bg: string; card: string; cardRaised: string; cardHeader: string;
  text: string; textMuted: string; white: string; border: string; ring: string;
}) {
  const id = "ls-dark-overrides";
  if (document.getElementById(id)) return;
  const css = `
  #luckysheet, .luckysheet, .luckysheet-cell-main {
    background: ${s.card} !important;
    color: ${s.text} !important;
  }
  .luckysheet-cols-h-c, .luckysheet-rows-h {
    background: ${s.cardHeader} !important;
    color: ${s.text} !important;
    border-color: ${s.border} !important;
  }
  .luckysheet-col-header, .luckysheet-row-header, .luckysheet-cs-inner {
    background: ${s.cardHeader} !important;
    color: ${s.text} !important;
  }
  .luckysheet-cell-main .luckysheet-grid-window-1, 
  .luckysheet-cell-main .luckysheet-grid-window-2,
  .luckysheet-cell-main .luckysheet-grid-window-3 {
    border-color: ${s.border} !important;
  }
  .luckysheet-cell-main td, .luckysheet-cell-main th {
    border-color: ${s.border} !important;
  }
  .luckysheet-selection-copy, .luckysheet-selection {
    border-color: ${s.white} !important;
  }
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
  .luckysheet-toolbar, .luckysheet-wa-editor, .luckysheet-wa-calc-workbook {
    display: none !important;
  }
  .luckysheet-env { background: ${s.cardRaised} !important; color: ${s.text} !important; }
  .luckysheet-cols-menu, .luckysheet-mousedown-cancel2 {
    background: ${s.cardRaised} !important; color: ${s.text} !important; border-color: ${s.border} !important;
  }
  #luckysheet::-webkit-scrollbar, .luckysheet-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
  #luckysheet::-webkit-scrollbar-thumb, .luckysheet-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
  `;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}
