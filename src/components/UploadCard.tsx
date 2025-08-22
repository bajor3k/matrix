
"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import * as xlsx from "xlsx";
import { Upload, Trash2 } from 'lucide-react';

type UploadCardProps = {
  onFileAccepted?: (file: File) => void;
  onFileCleared?: () => void;
  className?: string;
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
        setFile(null); 
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

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true, // We trigger click via the icon button
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetUI();
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center text-center relative",
        "rounded-xl border-2 border-dashed",
        "p-8 cursor-pointer transition-colors duration-200 w-full h-44", // Adjusted width to full
        "bg-transparent", // No background fill
        isDragActive
          ? "border-[#08e28f] text-[#08e28f]"
          : "border-white/40 text-white/90",
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Top-center icon for upload or remove */}
      {!file ? (
        <button
          type="button"
          onClick={open}
          className="absolute -top-3 bg-black px-2 rounded-full"
          aria-label="Upload file"
        >
          <Upload className="w-6 h-6 text-white/80 hover:text-[#08e28f]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-3 bg-black px-2 rounded-full"
          aria-label="Remove file"
        >
          <Trash2 className="w-6 h-6 text-[#e31211] hover:text-red-600" />
        </button>
      )}

      {/* Center content */}
      {!file ? (
        <>
          <p className="text-base font-semibold mt-4">
            {dropzoneText || 'Drop file here'}
          </p>
          <p className="text-sm text-white/70 mt-1">
            or{" "}
            <span onClick={(e) => { e.stopPropagation(); open(); }} className="text-[#08e28f] font-medium hover:underline cursor-pointer">
              browse
            </span>{" "}
            from your computer
          </p>
        </>
      ) : (
        <div className="mt-4 text-center">
          {errorMsg ? (
              <p className="text-sm text-red-400">{errorMsg}</p>
          ) : (
            <>
              <p className="text-sm text-white/90">{file.name}</p>
              <p className="text-sm text-[#08e28f] mt-1">Success 🙂</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
