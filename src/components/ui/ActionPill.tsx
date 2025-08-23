// components/ui/ActionPill.tsx
import * as React from "react";

export function ActionPill({
  onClick,
  disabled,
  icon,
  label,
  srLabel,
  title,
  variant = "default", // 'default' | 'primary'
  className = "",
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  srLabel?: string;
  title?: string;
  variant?: "default" | "primary";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full h-11 px-4 " +
    "border transition-colors select-none " +
    "disabled:opacity-55 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? // BRAND GREEN #08e28f
        "bg-[#08e28f] text-black border-transparent hover:brightness-95"
      : // dark/light neutral pill
        "bg-[#121212] text-white dark:bg-white/10 dark:text-white " +
        "border-black/10 dark:border-white/10 hover:bg-black dark:hover:bg-white/15";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={srLabel || label}
      title={title || label}
      className={[base, styles, className].join(" ")}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}
