// components/ui/ActionPill.tsx
import * as React from "react";

export function ActionPill({
  onClick,
  disabled,
  icon,
  label,        // visible label: "Excel", "CSV", "Run Report", etc.
  srLabel,      // screen-reader label: e.g. "Download Excel"
  title,        // optional tooltip
  className = "",
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  srLabel?: string;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={srLabel || label}
      title={title || label}
      className={[
        "inline-flex items-center gap-2 rounded-full h-11 px-4",
        "border border-black/10 dark:border-white/10",
        "bg-[#121212] text-white dark:bg-white/10 dark:text-white",
        "hover:bg-black dark:hover:bg-white/15",
        "disabled:opacity-55 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}
