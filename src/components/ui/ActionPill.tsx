import * as React from "react";
import { cn } from "@/lib/utils";

type Emphasis = "normal" | "bright" | "active";

export function ActionPill({
  onClick,
  disabled,
  icon,
  label,
  srLabel,
  title,
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
  labelEmphasis?: Emphasis;
  className?: string;
  isRunning?: boolean;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors duration-150 disabled:opacity-55 text-[var(--pill-font-size)] font-medium";
  
  const themeClasses = 
    "border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  const emphasisClasses = {
    normal: "text-muted-foreground cursor-not-allowed",
    bright: "text-foreground hover:text-accent-foreground cursor-pointer",
    active: "text-accent-foreground ring-1 ring-border cursor-pointer",
  };
  
  const runningClasses = isRunning ? "text-muted-foreground cursor-wait" : "";

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
