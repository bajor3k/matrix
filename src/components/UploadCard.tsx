
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload as UploadIcon } from "lucide-react";
import * as xlsx from "xlsx";

type UploadCardProps = {
  title: string;
  reportId: string;
  onFileAccepted?: (file: File) => void;
  className?: string;
  children?: React.ReactNode;
  slotId?: string; // Add a slotId to identify which uploader was used
};

const SUCCESS_COPY = "File uploaded successfully.";

export default function UploadCard({
  title,
  reportId,
  onFileAccepted,
  className,
  children,
  slotId,
}: UploadCardProps) {
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setStatusMsg(null);
      setErrorMsg(null);

      if (fileRejections.length > 0) {
        setErrorMsg(`File rejected: ${fileRejections[0].errors[0].message}`);
        return;
      }
      
      const file = acceptedFiles?.[0];
      if (!file) return;

      onFileAccepted?.(file);
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
            detail: { slotId, file, rows, columns: Object.keys(rows[0] || {}) }
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
      reader.readAsArrayBuffer(file);
    },
    [onFileAccepted, slotId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10 MB
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    }
  });
  
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
                <span className="text-white">{displayId}</span>
            </div>
        )}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative grid place-items-center rounded-xl border border-dashed p-7 min-h-[150px] transition-colors",
          "border-[#2a2b30] bg-transparent",
          isDragActive ? "bg-[#1516c] border-[#3a3b42]" : "hover:bg-[#13141a]"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center select-none">
          <UploadIcon className="mx-auto h-7 w-7 text-emerald-500" />
          <div className="mt-2 text-sm font-semibold text-zinc-200">Drag &amp; drop here</div>
          <div className="text-xs text-zinc-500">
            or <span className="underline">browse</span> from your computer
          </div>
        </div>
        {children}
      </div>

      {/* PERSISTENT STATUS SLOT (prevents height jump) */}
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
          // Invisible placeholder keeps the same height before upload
          <span className="invisible text-sm font-semibold">placeholder</span>
        )}
      </div>
    </div>
  );
}
