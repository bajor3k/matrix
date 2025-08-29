
"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DropTileProps = {
  label: string;                   // e.g., "Report 1"
  accept?: string;                 // ".xlsx,.csv"
  onFile: (file: File | null) => void;
  file?: File | null;
  className?: string;
};

export function DropTile({
  label,
  accept = ".xlsx,.csv",
  onFile,
  file,
  className,
}: DropTileProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const openPicker = () => inputRef.current?.click();
  const handleFiles = (fl: FileList | null) => {
    if (fl && fl.length) onFile(fl[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-2xl p-5 cursor-pointer select-none transition",
        "bg-[#0c0c0c] shadow-none border-0",
        drag ? "ring-1 ring-emerald-400/40" : "ring-0",
        className
      )}
      onClick={openPicker}
      role="button"
      aria-label={`${label} dropzone`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {!file ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Upload className="h-6 w-6 text-emerald-400 mb-2" />
          <div className="text-sm text-white/90 font-medium">{label}</div>
          <div className="text-xs text-white/55 mt-1">Browse or drop file</div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-white/90 font-medium">{label}</div>
            <div className="text-xs text-white/60 truncate">{file.name}</div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-xs"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
          >
            <X className="h-4 w-4" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
