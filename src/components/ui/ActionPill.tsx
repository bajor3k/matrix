import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral"; // 'primary' is removed
type Emphasis = "normal" | "bright" | "active";

export function ActionPill({
  onClick,
  disabled,
  icon,
  label,
  srLabel,
  title,
  variant = "neutral",
  labelEmphasis = "normal",
  className = "",
  isRunning = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  srLabel?: string;
  title?: string;
  variant?: Variant;
  labelEmphasis?: Emphasis;
  className?: string;
  isRunning?: boolean;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors duration-150 disabled:opacity-55 text-[var(--pill-font-size)] font-semibold";

  const themeClasses =
    "bg-black/30 dark:bg-black/30 border-neutral-800/60 dark:border-neutral-800/60 backdrop-blur-sm";

  const emphasisClasses = {
    normal: "text-neutral-500 dark:text-neutral-500 cursor-not-allowed",
    bright: "text-neutral-200 dark:text-neutral-200 hover:text-white dark:hover:text-white cursor-pointer",
    active: "text-white dark:text-white ring-1 ring-white/15 hover:ring-white/25 cursor-pointer",
  };

  const runningClasses = isRunning ? "text-neutral-400 dark:text-neutral-400 cursor-wait" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isRunning}
      aria-label={srLabel || label}
      title={title || label}
      className={cn(
          baseClasses,
          themeClasses,
          isRunning ? runningClasses : emphasisClasses[labelEmphasis],
          className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="leading-none">{label}</span>
    </button>
  );
}
