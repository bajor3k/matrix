
// components/chrome/FullscreenToggle.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";

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
  onEnter?: () => void;
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
    <Button
      variant="ghost"
      size="icon"
      aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={toggle}
      className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      title={isFs ? "Exit fullscreen (Esc)" : "Fullscreen"}
    >
      {isFs ? (
        <Minimize2 className="w-5 h-5" />
      ) : (
        <Maximize2 className="w-5 h-5" />
      )}
    </Button>
  );
}
