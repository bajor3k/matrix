"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPT = ".xlsx,.xls"; // adjust if you also want .csv

export default function ExcelTriplePicker({
  open,
  onOpenChange,
  onComplete,
  title = "Select Files",
  labels = ["Report 1", "Report 2", "Report 3"],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (files: { report1: File; report2: File; report3: File }) => void;
  title?: string;
  labels?: string[];
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, 3 - files.length);

  const reset = () => setFiles([]);

  const acceptFiles = (fl: FileList | null) => {
    if (!fl) return;
    const next: File[] = [];
    for (const f of Array.from(fl)) {
      if (!ACCEPT.split(",").some(ext => f.name.toLowerCase().endsWith(ext.trim()))) continue;
      next.push(f);
      if (files.length + next.length >= 3) break;
    }
    if (!next.length) return;
    const merged = [...files, ...next].slice(0, 3);
    setFiles(merged);
  };

  // Auto-close when we have 3
  React.useEffect(() => {
    if (files.length === 3) {
      const payload = { report1: files[0], report2: files[1], report3: files[2] };
      // Delay slightly so users see 3/3 then close
      const t = setTimeout(() => {
        onComplete(payload);
        onOpenChange(false);
        // do NOT reset here; caller keeps files
      }, 400);
      return () => clearTimeout(t);
    }
  }, [files, onComplete, onOpenChange]);

  const onDrop: React.DragEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    acceptFiles(e.dataTransfer.files);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-2xl border-0 bg-[#0b0b0b] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-white/70 mb-2">
          Upload three separate Excel files to run this report.
        </p>

        {/* Big single drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-2xl border-0 bg-[#0c0c0c] px-4 py-10 flex flex-col items-center justify-center text-center"
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Browse or drop Excel file"
        >
          <Upload className="h-7 w-7 text-emerald-400 mb-2" />
          <div className="text-sm font-medium text-white/90">Browse or Drop Excel File</div>
          <div className="text-xs text-white/55 mt-1">Accepted: .xlsx, .xls • {files.length}/3 selected</div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple={true}
            className="hidden"
            onChange={(e) => {
              acceptFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </div>

        {/* Selected list */}
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-[#0c0c0c] px-3 py-2"
            >
              <div className="truncate text-sm">
                <span className="text-white/65 mr-2">{labels[i] ?? `Report ${i + 1}`}:</span>
                <span className="text-white/90">{f.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full h-8 px-3 text-white/80 hover:text-white"
                onClick={() => {
                  const next = files.slice();
                  next.splice(i, 1);
                  setFiles(next);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ))}

          {remaining > 0 && (
            <div className="text-xs text-white/60 mt-1">
              Add {remaining} more file{remaining === 1 ? "" : "s"} to continue…
            </div>
          )}
        </div>

        {/* No footer buttons needed — auto closes on 3/3. */}
      </DialogContent>
    </Dialog>
  );
}
