import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload as UploadIcon } from "lucide-react";

type UploadCardProps = {
  title: string;
  reportId: string;
  onFileAccepted?: (file: File) => void;
  className?: string;
};

const SUCCESS_COPY = "File uploaded successfully.";

export default function UploadCard({
  title,
  reportId,
  onFileAccepted,
  className,
}: UploadCardProps) {
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      const file = accepted?.[0];
      if (!file) return;
      onFileAccepted?.(file);
      setStatusMsg(SUCCESS_COPY);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className={cn("rounded-2xl p-4 border border-[#26272b] bg-[#0a0a0a]", className)}>
      {/* Header */}
      <div className="mb-2 text-base font-bold tracking-wide text-zinc-200">
        REPORT ID: <span className="text-white">{reportId}</span>
      </div>

      {/* Dropzone */}
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
          <UploadIcon className="mx-auto h-7 w-7 text-emerald-500" />
          <div className="mt-2 text-sm font-semibold text-zinc-200">Drag &amp; drop here</div>
          <div className="text-xs text-zinc-500">
            or <span className="underline">browse</span> from your computer
          </div>
        </div>
      </div>

      {/* PERSISTENT STATUS SLOT (prevents height jump) */}
      <div className="mt-3 h-6 flex items-center justify-center">
        {statusMsg ? (
          <span className="text-sm font-semibold text-emerald-500" role="status" aria-live="polite">
            {statusMsg}
          </span>
        ) : (
          // Invisible placeholder keeps the same height before upload
          <span className="invisible text-sm font-semibold">placeholder</span>
        )}
      </div>
    </div>
  );
}
