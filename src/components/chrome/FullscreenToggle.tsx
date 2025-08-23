// components/chrome/FullscreenToggle.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

declare global {
  interface Document {
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitFullscreenElement?: Element | null;
  }
  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void> | void;
  }
}

export default function FullscreenToggle({
  className,
  onEnter,
  onExit,
}: {
  className?: string;
  onEnter?: () => void; // optional hooks if you ever want to collapse the sidebar, etc.
  onExit?: () => void;
}) {
  const [isFs, setIsFs] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const inFullscreen = () =>
    !!(document.fullscreenElement || document.webkitFullscreenElement);

  const enter = useCallback(async () => {
    const root = document.documentElement as HTMLElement;
    try {
      if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else throw new Error("Fullscreen API not available");
      onEnter?.();
    } catch {
      // Fallback: presentation mode (no URL bar removal, but full-bleed app)
      document.documentElement.classList.add("presentation-mode");
      setIsSupported(false);
      setIsFs(true);
      onEnter?.();
    }
  }, [onEnter]);

  const exit = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      // fallthrough to finally
    } finally {
      document.documentElement.classList.remove("presentation-mode");
      onExit?.();
    }
  }, [onExit]);

  const toggle = async () => (isFs ? exit() : enter());

  useEffect(() => {
    const sync = () => setIsFs(inFullscreen());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={toggle}
      className={[
        "fs-btn inline-flex items-center justify-center w-9 h-9 rounded-lg",
        "hover:bg-black/5 dark:hover:bg-white/5",
        className || "",
      ].join(" ")}
      title={isFs ? "Exit fullscreen (Esc)" : "Fullscreen"}
    >
      {isFs ? (
        <Minimize2 className="w-5 h-5 text-gray-600 dark:text-white/70" />
      ) : (
        <Maximize2 className="w-5 h-5 text-gray-600 dark:text-white/70" />
      )}
    </button>
  );
}
