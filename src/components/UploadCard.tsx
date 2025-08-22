
"use client";

import { useDropzone, type FileRejection } from "react-dropzone";
import React, { useCallback, useState } from "react";
import { Upload, Trash2 } from "lucide-react"; // using lucide icons
import { cn } from "@/lib/utils";

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
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      const acceptedFile = acceptedFiles[0];
      setFile(acceptedFile);
      if (onFileAccepted) {
        onFileAccepted(acceptedFile);
      }
    }
  }, [onFileAccepted]);


  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger dropzone click
    setFile(null);
    if (onFileCleared) {
      onFileCleared();
    }
     const event = new CustomEvent('upload:cleared', { detail: { slotId } });
     window.dispatchEvent(event);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true, // we will open via the icon (and still allow keyboard)
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        // layout: NO fixed height; compact spacing
        "flex flex-col items-center justify-center text-center gap-2",
        "rounded-xl border-2 border-dashed bg-transparent",
        isDragActive ? "border-[#08e28f] text-[#08e28f]" : "border-foreground/30 text-foreground/90",
        "px-6 py-5 cursor-pointer transition-colors",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!file && (e.key === "Enter" || e.key === " ")) open();
      }}
    >
      <input {...getInputProps()} />

      {/* ICON: centered INSIDE the box */}
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

      {/* CONTENT */}
      {!file ? (
        <>
          <p className="text-base font-semibold leading-tight">{dropzoneText || 'Drop file here'}</p>
          <p className="text-sm text-muted-foreground leading-tight">
            or <span onClick={(e) => { e.stopPropagation(); open(); }} className="text-[#08e28f] font-medium hover:underline">browse</span> from your
            computer
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-foreground/90 leading-tight">{file.name}</p>
          <p className="text-sm text-[var(--success-green)] leading-tight">Success 🙂</p>
        </>
      )}
    </div>
  );
}
