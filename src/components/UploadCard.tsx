
// components/UploadCard.tsx
import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

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
    <div className={cn("upload-card", className)}>
      <div className="upload-inner">
        <div className="upload-title-wrap">
          <div className="upload-title">{title}</div>
        </div>
        <div
          {...getRootProps()}
          className={cn(
            "dropzone",
            isDragActive && "dropzone-active"
          )}
        >
          <input {...getInputProps()} />
          <div className="dropzone-body">
            <div className="drop-icon">⬆️</div>
            <div className="drop-title">Drag &amp; drop here</div>
            <div className="drop-sub">
              or <span className="browse">browse</span> from your computer
            </div>
          </div>
        </div>
        {isBusy && <div className="file-status">Checking file…</div>}
        {statusMsg && (
          <div className="file-status ok" role="status" aria-live="polite">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
