"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import React from "react";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  dropzoneText?: string;
  className?: string;
  accept?: string;
  slot?: number;
};

export default function UploadCard({
  file,
  onFileChange,
  dropzoneText = "Drop file here",
  className,
  accept,
  slot,
}: UploadCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        console.warn("File rejected:", fileRejections);
      }
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange]
  );
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: accept ? { 'application/vnd.ms-excel': ['.xls', '.xlsx'], 'text/csv': ['.csv'] } : undefined,
    noKeyboard: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center text-center gap-2",
        "rounded-2xl bg-card border",
        "px-6 py-5 cursor-pointer transition-colors",
        "hover:border-primary/50",
        isDragActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "",
        className
      )}
      aria-label={`Upload file ${slot}`}
    >
      <input {...getInputProps()} />

      <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
        {file ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove file from slot ${slot}`}
            className="p-1 rounded hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        ) : (
          <Upload className="w-6 h-6 text-primary" />
        )}
      </div>

      {!file ? (
        <p className="mt-5 text-base font-semibold leading-tight text-foreground">
          {dropzoneText}
        </p>
      ) : (
        <p className="mt-6 text-sm text-primary leading-tight">
          Success <span aria-hidden>🙂</span>
        </p>
      )}
    </div>
  );
}
