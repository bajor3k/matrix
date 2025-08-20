
"use client";

import React from "react";
import { README_CONTENT_3M_CASH } from "./readme-content";
import ReadmeCard from "@/components/ReadmeCard";
import { Upload, Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

type UploadKey = "pycash_1" | "pycash_2" | "pypi";

interface UploadCardProps {
  title: string;
  onFileAccepted: (file: File) => void;
  className?: string;
  isUploaded: boolean;
}

function UploadCard({ title, onFileAccepted, className, isUploaded }: UploadCardProps) {
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
    <div className={cn("rounded-2xl bg-[#0f0f13] p-4 shadow-sm border border-[#26272b]", className)}>
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">
        {title}
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "relative grid place-items-center rounded-xl border border-dashed border-[#26272b] p-6 min-h-[150px] bg-transparent transition-colors",
          isDragActive ? "bg-[#15161c]" : "bg-transparent",
          "cursor-pointer"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center select-none">
          <div className="text-2xl leading-none">⬆️</div>
          <div className="mt-2 text-sm font-medium text-zinc-200">Drag &amp; drop here</div>
          <div className="text-xs text-zinc-500">
            or <span className="underline">browse</span> from your computer
          </div>
          <div className="mt-1 text-[10px] text-zinc-600">
            Max 10MB • .xlsx / .xls / .csv
          </div>
        </div>
      </div>
       {isUploaded && (
        <div className="mt-3 text-xs text-emerald-500" role="status" aria-live="polite">File uploaded successfully.</div>
      )}
    </div>
  );
}


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
      saveAs(blob, "3m_cash_merged.xlsx");

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
                  isUploaded={ok.pycash_1}
                  className="min-h-[220px]"
                />
                <UploadCard
                  title="Report ID: PYCASH"
                  onFileAccepted={(file) => handleParsed("pycash_2", file)}
                  isUploaded={ok.pycash_2}
                  className="min-h-[220px]"
                />
                <UploadCard
                  title="Report ID: PYPI"
                  onFileAccepted={(file) => handleParsed("pypi", file)}
                  isUploaded={ok.pypi}
                  className="min-h-[220px]"
                />
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  onClick={handleRun}
                  disabled={!allReady || isRunning}
                  className={cn(
                    "rounded-2xl px-5 py-3 text-sm font-semibold transition shadow-sm",
                    allReady && !isRunning
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                      : "bg-[#2f3136] text-zinc-400 cursor-not-allowed"
                  )}
                >
                  {isRunning ? <Loader2 className="animate-spin h-4 w-4 inline mr-2" /> : null}
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
