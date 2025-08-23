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
  srLabel?: string;
  title?: string;
  variant?: Variant;
  labelEmphasis?: Emphasis;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors " +
    "disabled:opacity-55 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "bg-[#08e28f] text-black border-transparent hover:brightness-95"
      : "bg-[#121212] border-black/10 dark:border-white/10 hover:bg-black";

  const labelClasses =
    variant === "primary"
      ? "text-black"
      : labelEmphasis === "bright"
      ? "text-white"
      : "text-white/70";

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
