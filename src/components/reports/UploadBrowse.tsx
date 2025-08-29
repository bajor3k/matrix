// src/components/reports/UploadBrowse.tsx
"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadBrowse({
  className = "",
}: { className?: string }) {
  // ⚠️ No <input type="file"> is rendered at all.
  // Button is visually enabled but inert.

  const kill = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Button
      type="button"
      aria-disabled="true"
      onClick={kill}
      onMouseDown={kill}
      onKeyDown={(e) => {
        // swallow Enter/Space so keyboard users don't trigger anything
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); }
      }}
      className={
        "rounded-full bg-[#0c0c0c] hover:bg-[#121212] text-white px-4 h-9 " +
        "shadow-none border-0 " + className
      }
    >
      <Upload className="mr-2 h-4 w-4 text-emerald-400" aria-hidden="true" />
      Browse
    </Button>
  );
}
