"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

function Tile({
  label,
  file,
  onFile,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const openPicker = () => inputRef.current?.click();

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onFile(f);
      }}
      className={`rounded-2xl p-4 bg-[#0c0c0c] border-0 shadow-none transition
                  ${drag ? "ring-1 ring-emerald-400/40" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0] ?? null; onFile(f); e.currentTarget.value = ""; }}
      />

      {!file ? (
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex flex-col items-center justify-center py-6 rounded-xl bg-black/20 hover:bg-black/30"
        >
          <Upload className="h-6 w-6 text-emerald-400 mb-2" />
          <div className="text-white/90 text-sm font-medium">{label}</div>
          <div className="text-white/60 text-xs">Browse or drop file</div>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-white/90 text-sm font-medium">{label}</div>
            <div className="text-white/60 text-xs truncate">{file.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="h-8 rounded-full" onClick={openPicker}>Replace</Button>
            <Button variant="ghost" className="h-8 rounded-full" onClick={() => onFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThreeFileUploadModal({
  open,
  onOpenChange,
  onComplete,
  labels = ["Report 1","Report 2","Report 3"],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (files: { report1: File; report2: File; report3: File }) => void;
  labels?: [string, string, string] | string[];
}) {
  const [r1, setR1] = React.useState<File | null>(null);
  const [r2, setR2] = React.useState<File | null>(null);
  const [r3, setR3] = React.useState<File | null>(null);
  const ready = !!(r1 && r2 && r3);

  const reset = () => { setR1(null); setR2(null); setR3(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-3xl bg-[#0b0b0b] border-0 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Upload the three required files</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-white/70">
          You’ll need three separate reports to run this. Use <b>Browse</b> or drag & drop each one below.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label={labels[0] as string} file={r1} onFile={setR1} />
          <Tile label={labels[1] as string} file={r2} onFile={setR2} />
          <Tile label={labels[2] as string} file={r3} onFile={setR3} />
        </div>

        <DialogFooter className="mt-1">
          <Button variant="secondary" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="rounded-full"
            disabled={!ready}
            onClick={() => {
              if (!ready) return;
              onComplete({ report1: r1!, report2: r2!, report3: r3! });
              onOpenChange(false);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}