
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
import * as xlsx from "xlsx";

type UploadCardProps = {
  title?: string;
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
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const resetUI = React.useCallback(() => {
    setFile(null);
    setErrorMsg(null);
    if (onFileCleared) onFileCleared();
    if (slotId) {
      window.dispatchEvent(new CustomEvent('upload:cleared', { detail: { slotId } }));
    }
  }, [onFileCleared, slotId]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setErrorMsg(null);

      if (fileRejections.length > 0) {
        setErrorMsg(`File rejected: ${fileRejections[0].errors[0].message}`);
        return;
      }
      
      const droppedFile = acceptedFiles?.[0];
      if (!droppedFile) return;

      setFile(droppedFile);
      if (onFileAccepted) onFileAccepted(droppedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = xlsx.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = xlsx.utils.sheet_to_json(worksheet);
          
          if (slotId) {
            window.dispatchEvent(new CustomEvent('upload:parsed', {
              detail: { slotId, file: droppedFile, rows, columns: Object.keys(rows[0] || {}) }
            }));
          }

        } catch (e: any) {
           setErrorMsg(`Error parsing file: ${e.message}`);
        }
      };
      reader.onerror = () => {
         setErrorMsg("Could not read the uploaded file.");
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

  const displayId = (reportId ?? "").toString().trim();

  return (
    <div className={cn("upload-card bg-transparent border-0 shadow-none p-0", className)}>
      <div className="flex flex-col gap-2">
        {displayId && displayId !== "—" && (
            <div className="text-[11px] md:text-xs font-semibold tracking-wide text-white/70">
              REPORT ID: <span className="text-white">{displayId}</span>
            </div>
        )}

        {file ? (
           <div className="flex flex-col gap-1">
             <div className="text-sm md:text-base font-medium text-white/90 leading-tight">
               {file.name}
             </div>
             {!errorMsg && (
                <div className="text-xs md:text-sm leading-tight text-[var(--success-green,#22c55e)]">
                  {SUCCESS_COPY}
                </div>
             )}
             {errorMsg && (
                <div className="text-xs md:text-sm leading-tight text-red-500">
                  {errorMsg}
                </div>
             )}
             <div className="flex items-center gap-4">
                <button type="button" onClick={open} className="mt-1 w-fit text-xs underline underline-offset-2 text-white/60 hover:text-white/80 focus:outline-none">
                  Replace
                </button>
                <button type="button" onClick={resetUI} className="mt-1 w-fit text-xs underline underline-offset-2 text-red-400/80 hover:text-red-400 focus:outline-none">
                  Remove
                </button>
             </div>
           </div>
        ) : (
          <div
            {...getRootProps()}
            onClick={open}
            className={cn(
              "border border-dashed border-white/10 rounded-xl",
              "p-6 cursor-pointer transition-colors",
              isDragActive ? "bg-white/5" : "bg-transparent hover:bg-white/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-sm text-center text-white/60">
              {isDragActive ? "Drop the file here…" : "Drag & drop or click to upload"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
