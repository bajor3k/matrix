// src/components/reports/TestFilesModal.tsx
"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, Trash2, Upload } from "lucide-react";

type TestFilesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (files: { report1: File; report2: File; report3: File }) => void;
};

const ACCEPT =
  ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export default function ReportDownloadModal({ open, onOpenChange, onComplete }: TestFilesModalProps) {
  const [test1, setTest1] = useState<File | null>(null);
  const [test2, setTest2] = useState<File | null>(null);
  const [test3, setTest3] = useState<File | null>(null);

  const i1 = useRef<HTMLInputElement>(null);
  const i2 = useRef<HTMLInputElement>(null);
  const i3 = useRef<HTMLInputElement>(null);

  const allSelected = !!(test1 && test2 && test3);

  const pick = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click();

  const onPick =
    (setter: (f: File | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setter(file);
    };

  const clear = (setter: (f: File | null) => void, ref: React.RefObject<HTMLInputElement>) => {
    setter(null);
    if (ref.current) ref.current.value = "";
  };
  
  const resetAndClose = () => {
    setTest1(null);
    setTest2(null);
    setTest3(null);
    onOpenChange(false);
  }

  const done = () => {
    if (test1 && test2 && test3) {
      onComplete({ report1: test1, report2: test2, report3: test3 });
      resetAndClose();
    }
  };

  return (
     <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative w-[720px] max-w-[92vw] rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-foreground tracking-wide">SELECT FILES TO DOWNLOAD</h2>
          <button
            onClick={resetAndClose}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* CONTENT — ONLY THE THREE TILES */}
        <div className="px-5 pt-5 pb-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FileTile
              label="Test 1"
              file={test1}
              onPick={() => pick(i1)}
              onClear={() => clear(setTest1, i1)}
            />
            <FileTile
              label="Test 2"
              file={test2}
              onPick={() => pick(i2)}
              onClear={() => clear(setTest2, i2)}
            />
            <FileTile
              label="Test 3"
              file={test3}
              onPick={() => pick(i3)}
              onClear={() => clear(setTest3, i3)}
            />
          </div>

          {/* Hidden inputs */}
          <input ref={i1} type="file" accept={ACCEPT} onChange={onPick(setTest1)} className="hidden" />
          <input ref={i2} type="file" accept={ACCEPT} onChange={onPick(setTest2)} className="hidden" />
          <input ref={i3} type="file" accept={ACCEPT} onChange={onPick(setTest3)} className="hidden" />

          {/* Progress hint */}
          <div className="mt-4 text-sm text-muted-foreground">
            {Number(!!test1) + Number(!!test2) + Number(!!test3)}/3 uploaded
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={resetAndClose}
            className="px-4 py-2 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={done}
            disabled={!allSelected}
            className={`px-4 py-2 rounded-full border border-border bg-background transition text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function FileTile({
  label,
  file,
  onPick,
  onClear,
}: {
  label: string;
  file: File | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-foreground">{label}</span>
        {file ? (
          <button onClick={onClear} className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1" aria-label="Clear file">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Clickable area */}
      <button
        onClick={onPick}
        className="w-full rounded-lg border border-border bg-card px-3 py-10 text-center text-muted-foreground hover:text-foreground transition flex flex-col items-center justify-center"
      >
        {file ? (
          <span className="block truncate text-foreground">{file.name}</span>
        ) : (
          <>
            <Upload className="h-6 w-6 mb-2" />
            <span className="block">Browse</span>
          </>
        )}
      </button>
      
      {file && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400" aria-live="polite">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Success</span>
        </div>
      )}
    </div>
  );
}
