
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import * as xlsx from "xlsx";

type UploadCardProps = {
  onFileAccepted?: (file: File) => void;
  onFileCleared?: () => void;
  className?: string;
  children?: React.ReactNode;
  slotId?: string;
  dropzoneText?: string;
};

export default function UploadCard({
  onFileAccepted,
  onFileCleared,
  className,
  slotId,
  dropzoneText,
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
        setFile(null); // Ensure no file is set on rejection
        if (onFileCleared) onFileCleared();
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
    [onFileAccepted, onFileCleared, slotId]
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


  return (
    <div data-upload-card="true" className={cn("upload-card", className)}>
       <div
        {...getRootProps()}
        onClick={!file ? open : undefined}
        className={cn(
            "flex flex-col items-center justify-center text-center",
            "dropzone p-8 transition-colors duration-200 rounded-xl border-2 border-dashed bg-[#1f1f1f]",
            isDragActive ? "border-[#08e28f] text-[#08e28f]" : "border-white/40 text-white/90",
            !file && "cursor-pointer"
          )}
      >
        <input {...getInputProps()} />
        
        <p className="text-base font-semibold">
          {dropzoneText || 'Drop file here'}
        </p>
        <p className="text-sm text-white/70 mt-1">
          or{" "}
          <span onClick={open} className="text-[#08e28f] font-medium hover:underline cursor-pointer">
            browse
          </span>{" "}
          from your computer
        </p>

        {file && (
            <div className="mt-3 text-center">
                <p className="text-sm text-white/90">{file.name}</p>
                <p className={cn("text-xs mt-1", errorMsg ? "text-red-400" : "text-[var(--success-green)]")}>
                    {errorMsg || "File uploaded successfully."}
                </p>
                 <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                        className="text-xs underline underline-offset-2 text-white/60 hover:text-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          open();
                        }}
                    >
                        Replace
                    </button>
                    <button
                         className="text-xs underline underline-offset-2 text-red-400/80 hover:text-red-400"
                        onClick={(e) => {
                           e.stopPropagation();
                           resetUI();
                        }}
                    >
                        Remove
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
