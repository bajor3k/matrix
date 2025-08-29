"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, Trash2 } from "lucide-react";

const ACCEPT = ".xlsx,.xls";

type Triplet = { report1?: File; report2?: File; report3?: File };

export default function ReportDownloadModal({
  open,
  onOpenChange,
  onComplete,
  title = "SELECT FILES TO DOWNLOAD",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (files: { report1: File; report2: File; report3: File }) => void;
  title?: string;
}) {
  const [files, setFiles] = React.useState<Triplet>({});
  const ready = Boolean(files.report1 && files.report2 && files.report3);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => setFiles({});

  const placeInFirstEmpty = (f: File) => {
    setFiles(prev => {
      if (!prev.report1) return { ...prev, report1: f };
      if (!prev.report2) return { ...prev, report2: f };
      if (!prev.report3) return { ...prev, report3: f };
      return prev;
    });
  };

  const acceptList = (list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) {
      const n = f.name.toLowerCase();
      if (ACCEPT.split(",").some(ext => n.endsWith(ext.trim()))) placeInFirstEmpty(f);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    acceptList(e.dataTransfer.files);
  };

  const clearSlot = (slot: keyof Triplet) => setFiles(prev => ({ ...prev, [slot]: undefined }));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-3xl bg-[#0b0b0b] border-0 text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* NEW: Top big Browse/Drop zone (click => File Explorer) */}
        <div
          className="rounded-2xl bg-[#0c0c0c] border border-white/10 px-5 py-10 flex flex-col items-center justify-center text-center mb-4 cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <Upload className="h-7 w-7 text-emerald-400 mb-2" />
          <div className="text-sm font-medium text-white/90">
            Browse or drop Excel files
          </div>
          <div className="text-xs text-white/55 mt-1">Accepted: XLSX, XLS</div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              acceptList(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </div>

        {/* Three targets: renamed + NO per-slot Browse buttons */}
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            { key: "report1", label: "Test 1" },
            { key: "report2", label: "Test 2" },
            { key: "report3", label: "Test 3" },
          ] as const).map(({ key, label }) => {
            const f = files[key as keyof Triplet];
            return (
              <div
                key={key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="rounded-xl bg-[#0c0c0c] border border-white/10 px-3 py-3 min-h-[86px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/90 truncate">{label}</div>
                  {f ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Upload className="h-4 w-4 text-white/40" />
                  )}
                </div>

                <div className="text-xs text-white/60 truncate mt-1">
                  {f ? f.name : "Drop file here"}
                </div>

                <div className="flex gap-2 mt-2">
                  {f && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-full"
                      onClick={() => clearSlot(key as keyof Triplet)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-2">
          <div className="text-xs text-white/60 mr-auto">
            {Number(!!files.report1) + Number(!!files.report2) + Number(!!files.report3)}/3 uploaded
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!ready}
            className="rounded-full"
            onClick={() => {
              onComplete({
                report1: files.report1!,
                report2: files.report2!,
                report3: files.report3!,
              });
              onOpenChange(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
