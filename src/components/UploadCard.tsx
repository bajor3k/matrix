
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
import * as xlsx from "xlsx";
import { Button } from "./ui/button";

type UploadCardProps = {
  title: string;
  reportId: string;
  onFileAccepted?: (file: File) => void;
  onFileCleared?: () => void;
  className?: string;
  children?: React.ReactNode;
  slotId?: string;
};

const SUCCESS_COPY = "File uploaded successfully.";

export default function UploadCard({
  title,
  reportId,
  onFileAccepted,
  onFileCleared,
  className,
  children,
  slotId,
}: UploadCardProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const dropzoneRef = React.useRef<HTMLDivElement>(null);

  const resetUI = React.useCallback(() => {
    setFile(null);
    setStatusMsg(null);
    setErrorMsg(null);
    if (onFileCleared) onFileCleared();
    window.dispatchEvent(new CustomEvent('upload:cleared', { detail: { slotId } }));
  }, [onFileCleared, slotId]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setStatusMsg(null);
      setErrorMsg(null);

      if (fileRejections.length > 0) {
        setErrorMsg(`File rejected: ${fileRejections[0].errors[0].message}`);
        return;
      }
      
      const droppedFile = acceptedFiles?.[0];
      if (!droppedFile) return;

      setFile(droppedFile);
      if (onFileAccepted) onFileAccepted(droppedFile);
      setStatusMsg(SUCCESS_COPY);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = xlsx.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = xlsx.utils.sheet_to_json(worksheet);
          
          window.dispatchEvent(new CustomEvent('upload:parsed', {
            detail: { slotId, file: droppedFile, rows, columns: Object.keys(rows[0] || {}) }
          }));

        } catch (e: any) {
           setErrorMsg(`Error parsing file: ${e.message}`);
           setStatusMsg(null);
        }
      };
      reader.onerror = () => {
         setErrorMsg("Could not read the uploaded file.");
         setStatusMsg(null);
      }
      reader.readAsArrayBuffer(droppedFile);
    },
    [onFileAccepted, slotId]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (file && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      resetUI();
    }
  };

  const displayId = (reportId ?? "").toString().trim();

  return (
    <div className={cn("rounded-2xl p-4 border border-[#26272b] bg-[#0a0a0a]", className)}>
      <div className="flex items-center gap-2">
        {title && (
            <div className="mb-2 text-base font-bold tracking-wide text-zinc-200">
                {title}
            </div>
        )}
        {displayId && displayId !== "—" && (
            <div className="mb-3 text-[11px] md:text-xs font-semibold tracking-wide text-white/70">
              REPORT ID: <span className="text-white">{displayId}</span>
            </div>
        )}
      </div>

      <div
        {...getRootProps()}
        ref={dropzoneRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative grid place-items-center rounded-xl border border-dashed p-7 min-h-[150px] transition-colors outline-none focus:ring-2 focus:ring-accent",
          "border-[#2a2b30] bg-transparent",
          isDragActive ? "bg-[#1516c] border-[#3a3b42]" : "hover:bg-[#13141a]",
          !file && "cursor-pointer"
        )}
        onClick={() => !file && open()}
      >
        <input {...getInputProps()} />
        {!file ? (
          <div className="text-center select-none">
            <UploadIcon className="mx-auto h-7 w-7 text-emerald-500" />
            <div className="mt-2 text-sm font-semibold text-zinc-200">Drag & drop here</div>
            <div className="text-xs text-zinc-500">
              or <span className="underline">browse</span> from your computer
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="file-info">
              <div className="file-row">
                <span className="file-name truncate">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="file-actions">
                  <button className="icon-btn danger remove-btn" title="Remove file" aria-label="Remove file" onClick={(e) => { e.stopPropagation(); resetUI(); }}>
                    <Trash2 width="16" height="16" stroke="currentColor" strokeWidth="1.6" />
                  </button>
                  <button className="link-btn replace-btn" type="button" onClick={(e) => {e.stopPropagation(); open(); }}>Replace</button>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>

      <div className="mt-3 h-6 flex items-center justify-center">
        {statusMsg && !errorMsg && (
          <span className="text-sm font-semibold text-emerald-500" role="status" aria-live="polite">
            {statusMsg}
          </span>
        )}
        {errorMsg && (
            <span className="text-sm font-semibold text-red-500" role="alert" aria-live="assertive">
                {errorMsg}
            </span>
        )}
        {!statusMsg && !errorMsg && (
          <span className="invisible text-sm font-semibold">placeholder</span>
        )}
      </div>
    </div>
  );
}
