
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import * as xlsx from "xlsx";
import { UploadedFileDisplay } from "./UploadedFileDisplay";

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


  return (
    <div data-upload-card="true" className={cn("upload-card", className)}>
      <div className="upload-inner">
        {!file ? (
          <div
            {...getRootProps()}
            onClick={open}
            className={cn(
                "flex flex-col items-center justify-center text-center",
                "dropzone p-10 transition-colors duration-200 rounded-xl border-2 border-dashed",
                isDragActive ? "border-[#08e28f] text-[#08e28f]" : "border-white/40 text-white/90"
              )}
          >
            <input {...getInputProps()} />
            <p className="text-base font-semibold">
              {dropzoneText || 'Drop file here'}
            </p>
            <p className="text-sm text-white/70 mt-1">
              or{" "}
              <span className="text-[#08e28f] font-medium hover:underline">
                browse
              </span>{" "}
              from your computer
            </p>
          </div>
        ) : (
          <UploadedFileDisplay
            name={file.name}
            onReplace={() => open()}
            onRemove={resetUI}
            successText={errorMsg || "File uploaded successfully."}
            hasError={!!errorMsg}
          />
        )}
      </div>
    </div>
  );
}
