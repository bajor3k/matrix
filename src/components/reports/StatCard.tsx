// src/components/reports/StatCard.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // card shell
        "rounded-2xl border transition-colors",
        // dark + light consistency
        "bg-[#101010] border-white/10",
        "dark:bg-[#101010] dark:border-white/10",
        "light:bg-[#fcfbfb] light:border-black/10",
        // inner spacing
        "px-5 py-4",
        className
      )}
    >
      <div className="text-white/70 light:text-black/70 text-sm">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-white light:text-black">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-white/50 light:text-black/50">{hint}</div>
      ) : null}
    </div>
  );
}
