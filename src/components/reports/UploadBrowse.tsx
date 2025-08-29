// src/components/reports/UploadBrowse.tsx
"use client";

import * as React from "react";
import { Upload } from "lucide-react"; // green icon to match your drop cards
import { Button } from "@/components/ui/button";

type UploadBrowseProps = {
  accept?: string;                 // e.g., ".xlsx,.csv"
  multiple?: boolean;              // allow multiple files
  onFilesSelected?: (files: FileList) => void; // you can plug logic later
  /** NEW: when true, clicking the button will NOT open the file picker */
  disablePicker?: boolean;
  /** Optional custom click handler (e.g., open your modal) */
  onClick?: () => void;
  className?: string;              // extra classes if needed
  id?: string;                     // optional id for tests
};

export default function UploadBrowse({
  accept,
  multiple = false,
  onFilesSelected,
  disablePicker = false,
  onClick,
  className = "",
  id,
}: UploadBrowseProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // If disabled, do nothing except call onClick (to open your modal)
    if (disablePicker) {
      onClick?.();
      return;
    }
    // Otherwise open the native picker
    onClick?.();
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(e.target.files);
      // keep file input usable consecutively with the same file
      e.currentTarget.value = "";
    }
  };

  return (
    <>
      {!disablePicker && (
        <input
            ref={inputRef}
            id={id ?? "reports-browse-input"}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
        />
      )}
      <Button
        type="button"
        onClick={handleButtonClick}
        className={
          // pill style to match your action bar; dark bg; no border
          "rounded-full bg-[#0c0c0c] hover:bg-[#121212] text-white px-4 h-9 " +
          "shadow-none border-0 " + className
        }
      >
        <Upload className="mr-2 h-4 w-4 text-emerald-400" aria-hidden="true" />
        Browse
      </Button>
    </>
  );
}