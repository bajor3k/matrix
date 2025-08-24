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
      ? // Brand green #08e28f
        "bg-[#08e28f] text-black border-transparent hover:brightness-95"
      : // Neutral pill (dark/light aware)
        "bg-[#fcfbfb] text-black border-black/10 hover:bg-black/5 " + 
        "dark:bg-[#121212] dark:text-white dark:border-white/10 dark:hover:bg-white/5";

  // Label emphasis for neutral pills
  const labelClasses =
    variant === "primary"
      ? "text-black" // Green pill has black text
      : labelEmphasis === "bright"
      ? "text-black dark:text-white" // Bright text for enabled neutral pills
      : "text-black/60 dark:text-white/70"; // Muted text for disabled neutral pills

  // Icon color follows label color
  const iconClasses = labelClasses;


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
