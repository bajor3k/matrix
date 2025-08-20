import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload as UploadIcon } from "lucide-react"; // NEW: green SVG icon

type UploadCardProps = {
  title: string;
  onFileAccepted?: (file: File) => void;
  className?: string;
};

const SUCCESS_COPY = "File uploaded successfully.";

export default function UploadCard({
  title,
  onFileAccepted,
  className,
}: UploadCardProps) {
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const onDrop = React.useCallback((accepted: File[]) => {
    const file = accepted?.[0];
    if (!file) return;
    setIsBusy(true);
    onFileAccepted?.(file);
    setStatusMsg(SUCCESS_COPY);
    setIsBusy(false);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      className={cn(
        // Card: dark bg, neutral border (no purple)
        "rounded-2xl bg-[#0f0f13] p-4 shadow-sm border border-[#26272b]",
        className
      )}
    >
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">
        {title}
      </div>

      {/* Clean dropzone with dashed neutral border; subtle hover */}
      <div
        {...getRootProps()}
        className={cn(
          "relative grid place-items-center rounded-xl border border-dashed p-7 min-h-[150px] transition-colors",
          "border-[#2a2b30] bg-transparent",
          isDragActive ? "bg-[#15161c] border-[#3a3b42]" : "hover:bg-[#13141a]"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center select-none">
          {/* GREEN upload icon */}
          <UploadIcon className="mx-auto h-7 w-7 text-emerald-500" />

          <div className="mt-2 text-sm font-semibold text-zinc-200">
            Drag &amp; drop here
          </div>
          <div className="text-xs text-zinc-500">
            or <span className="underline">browse</span> from your computer
          </div>
        </div>
      </div>

      {/* Status line — bigger, bolder, centered, emerald */}
      {isBusy && (
        <div className="mt-3 text-sm text-center text-zinc-400">Checking file…</div>
      )}
      {statusMsg && (
        <div
          className="mt-3 text-sm font-semibold text-emerald-500 text-center"
          role="status"
          aria-live="polite"
        >
          {statusMsg}
        </div>
      )}
    </div>
  );
}
