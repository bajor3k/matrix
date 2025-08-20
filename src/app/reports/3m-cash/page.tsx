
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { README_CONTENT_3M_CASH } from "./readme-content";
import ReadmeCard from "@/components/ReadmeCard";

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

  const allReady = ok.pycash_1 && ok.pycash_2 && ok.pypi;

  function handleParsed(key: UploadKey, file: File) {
    setFiles((s) => ({ ...s, [key]: file }));
    setOk((s) => ({ ...s, [key]: true }));
  }

  async function handleRun() {
    if (!allReady) return;
    setIsRunning(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("pycash_1", files.pycash_1!);
      fd.append("pycash_2", files.pycash_2!);
      fd.append("pypi", files.pypi!);

      const res = await fetch("/api/reports/3m-cash/merge", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "3m_cash_merged.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
    } finally {
      setIsRunning(false);
    }
  }


  // This effect runs once on component mount to wire up the upload cards.
  useEffect(() => {
    
    const UPLOAD_SLOTS = [
      { id: 'cash-upload-a', title: 'Report ID: PYCASH', key: 'pycash_1' },
      { id: 'cash-upload-b', title: 'Report ID: PYCASH', key: 'pycash_2' },
      { id: 'cash-upload-c', title: 'Report ID: PYPI', key: 'pypi' },
    ];
    const FILE_LIMIT_MB = 10;
    const ALLOWED = ['xlsx', 'xls', 'csv'];

    const templateId = 'upload-card-template';

    function formatBytes(bytes: number) {
      if (!bytes) return "0 Bytes";
      const mb = bytes / (1024 * 1024);
      return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
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

    function makeUploader(slot: {id: string, title: string, key: UploadKey}) {
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
      
      if (previewWrap) {
        previewWrap.style.display = 'none';
      }

      const showError = (msg: string) => {
        info.hidden = false;
        okEl.hidden = true;
        errEl.hidden = false;
        errEl.textContent = msg;
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
          handleParsed(slot.key, file);
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

    UPLOAD_SLOTS.forEach(makeUploader);
  }, []);

  return (
    <div className="p-4">
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
                 <div className="flex flex-col items-center gap-2 pt-2">
                    <button
                      onClick={handleRun}
                      disabled={!allReady || isRunning}
                      className="rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40
                                 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2"
                    >
                      {isRunning && <Loader2 className="animate-spin h-4 w-4" />}
                      {isRunning ? "Merging…" : "Run 3M Cash Report"}
                    </button>
                    {!allReady && (
                      <div className="text-xs text-zinc-500">
                        Upload all three reports to enable the run.
                      </div>
                    )}
                    {error && <div className="text-xs text-rose-400">{error}</div>}
                  </div>
              </div>
            </div>
          </main>
    </div>
  );
}
