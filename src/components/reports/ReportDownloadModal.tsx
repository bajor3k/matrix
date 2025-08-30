// src/components/reports/TestFilesModal.tsx
"use client";

import React, { useRef, useState } from "react";

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
      onComplete({ test1, test2, test3 });
      resetAndClose();
    }
  };

  return (
     <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative w-[720px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white/85 tracking-wide">SELECT FILES TO DOWNLOAD</h2>
          <button
            onClick={resetAndClose}
            className="text-white/60 hover:text-white/90 transition"
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
          <div className="mt-4 text-sm text-white/50">
            {Number(!!test1) + Number(!!test2) + Number(!!test3)}/3 uploaded
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={resetAndClose}
            className="px-4 py-2 rounded-full border border-white/10 bg-black text-white/70 hover:text-white/90"
          >
            Cancel
          </button>
          <button
            onClick={done}
            disabled={!allSelected}
            className={`px-4 py-2 rounded-full border border-white/10 bg-black transition ${
              allSelected ? "text-white/85 hover:text-white" : "text-white/40 cursor-not-allowed"
            }`}
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
    <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-white/80">{label}</span>
        {file ? (
          <button onClick={onClear} className="text-white/50 hover:text-white/90 text-sm">
            Clear
          </button>
        ) : null}
      </div>

      {/* Clickable area */}
      <button
        onClick={onPick}
        className="w-full rounded-lg border border-white/10 bg-black px-3 py-10 text-center text-white/60 hover:text-white/85 transition"
      >
        {file ? (
          <span className="block truncate text-white/80">{file.name}</span>
        ) : (
          <>
            <span className="block mb-1">Drop file here</span>
            <span className="text-xs text-white/50">.xlsx or .xls</span>
          </>
        )}
      </button>
    </div>
  );
}
