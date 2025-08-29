// src/components/reports/UploadBrowse.tsx
"use client";

import * as React from "react";
import { Upload } from "lucide-react"; // green icon to match your drop cards
import { Button } from "@/components/ui/button";

type UploadBrowseProps = {
  accept?: string;                 // e.g., ".xlsx,.csv"
  multiple?: boolean;              // allow multiple files
  onFilesSelected?: (files: FileList) => void; // you can plug logic later
  className?: string;              // extra classes if needed
  id?: string;                     // optional id for tests
};

export default function UploadBrowse({
  accept,
  multiple = false,
  onFilesSelected,
  className = "",
  id,
}: UploadBrowseProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(e.target.files);
      // keep file input usable consecutively with the same file
      e.currentTarget.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        id={id ?? "reports-browse-input"}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        onClick={openPicker}
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
