
"use client";

import React from "react";
import { README_CONTENT_3M_CASH } from "./readme-content";
import ReadmeCard from "@/components/ReadmeCard";
import { Upload, Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

type UploadKey = "pycash_1" | "pycash_2" | "pypi";

interface UploadCardProps {
  title: string;
  onFileAccepted: (file: File) => void;
  className?: string;
}

function UploadCard({ title, onFileAccepted, className }: UploadCardProps) {
  const [file, setFile] = React.useState<File | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const acceptedFile = acceptedFiles?.[0];
    if (acceptedFile) {
      setFile(acceptedFile);
      onFileAccepted(acceptedFile);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className={cn("upload-card", className)}>
      <div className="upload-inner">
        <div className="upload-header">
          <div className="upload-title">{title}</div>
          <div className="upload-sub">Drop an Excel/CSV file or click to browse.</div>
        </div>
        <label {...getRootProps()} className={cn("dropzone", isDragActive && "is-drag")}>
          <input {...getInputProps()} />
          <div className="dropzone-body">
            <div className="drop-icon">⬆️</div>
            <div className="drop-title">Drag & drop here</div>
            <div className="drop-sub">or <span className="browse">browse</span> from your computer</div>
            <div className="drop-note">Max 10MB • .xlsx / .xls / .csv</div>
          </div>
        </label>
        {file && (
          <div className="file-info">
            <div className="file-row">
              <span className="file-name">{file.name}</span>
            </div>
            <div className="file-status ok">Parsed successfully.</div>
          </div>
        )}
      </div>
    </div>
  );
}
// Hack to get useDropzone working without installing the library
const useDropzone: any = ({ onDrop }: { onDrop: (files: File[]) => void; accept: any; multiple: boolean; maxSize: number; }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onDrop(Array.from(e.target.files));
        }
    };
    return {
        getRootProps: () => ({
            onClick: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = handleFileChange as any;
                input.click();
            }
        }),
        getInputProps: () => ({}),
        isDragActive: false
    };
};


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

  return (
    <div className="p-4">
      <main className="app-main fullbleed">
        <div className="content-pad">
          <div className="space-y-6">
            <ReadmeCard markdown={README_CONTENT_3M_CASH} />
             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <UploadCard
                  title="Report ID: PYCASH"
                  onFileAccepted={(file) => handleParsed("pycash_1", file)}
                  className="min-h-[220px]"
                />
                <UploadCard
                  title="Report ID: PYCASH"
                  onFileAccepted={(file) => handleParsed("pycash_2", file)}
                  className="min-h-[220px]"
                />
                <UploadCard
                  title="Report ID: PYPI"
                  onFileAccepted={(file) => handleParsed("pypi", file)}
                  className="min-h-[220px]"
                />
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
