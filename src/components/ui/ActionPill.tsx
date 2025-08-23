// components/ui/ActionPill.tsx
import * as React from "react";

type Variant = "neutral" | "primary";
type Emphasis = "normal" | "bright";

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
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  srLabel?: string;     // screen-reader label
  title?: string;       // tooltip
  variant?: Variant;    // neutral = dark pill, primary = brand green
  labelEmphasis?: Emphasis; // normal (muted) or bright (clickable)
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors " +
    "disabled:opacity-55 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? // Brand green #08e28f
        "bg-[#08e28f] text-black border-transparent hover:brightness-95"
      : // Neutral pill (dark), works in both themes
        "bg-[#121212] border-black/10 dark:border-white/10 hover:bg-black";

  // Label emphasis: brighter text after uploads (clickable)
  const labelClasses =
    variant === "primary"
      ? "text-black"
      : labelEmphasis === "bright"
      ? "text-white"
      : "text-white/70";

  // Icon follows same emphasis (use currentColor)
  const iconClasses =
    variant === "primary"
      ? "text-black"
      : labelEmphasis === "bright"
      ? "text-white"
      : "text-white/70";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={srLabel || label}
      title={title || label}
      className={[base, variantClasses, className].join(" ")}
    >
      {icon ? <span className={["shrink-0", iconClasses].join(" ")}>{icon}</span> : null}
      <span className={["leading-none transition-colors", labelClasses].join(" ")}>{label}</span>
    </button>
  );
}