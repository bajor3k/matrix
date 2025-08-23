"use client";

import { useDropzone, type FileRejection } from "react-dropzone";
import React,
{ useCallback } from "react";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  dropzoneText?: string;
  className?: string;
  accept?: string;
};

export default function UploadCard({
  file,
  onFileChange,
  dropzoneText = "Drop file here",
  className,
  accept,
}: UploadCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        console.warn("File rejected:", fileRejections);
        // Optionally, show a toast or error message to the user.
      }
      if (acceptedFiles.length > 0) {
        const acceptedFile = acceptedFiles[0];
        onFileChange(acceptedFile);
      }
    },
    [onFileChange]
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: accept ? { 'application/vnd.ms-excel': ['.xls', '.xlsx'], 'text/csv': ['.csv'] } : undefined, // Basic example
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center text-center gap-2",
        "rounded-xl border-2 border-dashed",
        isDragActive ? "border-[#08e28f] text-[#08e28f]" : "border-black/30 text-black/90 dark:border-white/40 dark:text-white/90",
        "px-6 py-5 cursor-pointer transition-colors",
        "bg-[#fcfbfb] dark:bg-[#101010]",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!file && (e.key === "Enter" || e.key === " ")) open();
      }}
    >
      <input {...getInputProps()} />

      {!file ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          aria-label="Upload file"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          title="Upload"
        >
          <Upload className="w-7 h-7 text-foreground/85 hover:text-[#08e28f]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove file"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          title="Remove"
        >
          <Trash2 className="w-7 h-7 text-[#e31211] hover:opacity-90" />
        </button>
      )}

      {!file ? (
        <>
          <p className="text-base font-semibold leading-tight">{dropzoneText}</p>
          <p className="text-sm text-black/60 dark:text-white/70 leading-tight">
            or <span onClick={(e) => { e.stopPropagation(); open(); }} className="text-[#08e28f] font-medium hover:underline">browse</span> from your
            computer
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-black/90 dark:text-white/90 leading-tight">{file.name}</p>
          <p className="text-sm text-[#08e28f] leading-tight">Success 🙂</p>
        </>
      )}
    </div>
  );
}
