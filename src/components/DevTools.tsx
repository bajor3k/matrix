"use client";

import * as React from 'react';

export default function DevTools() {
  React.useEffect(() => {
    const runDevExpose = async () => {
      if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
        try {
          await import('@/lib/askmaven/dev-expose');
        } catch (err) {
          console.warn("AskMaven dev-expose utility failed to load:", err);
        }
      }
    };
    runDevExpose();
  }, []);

  return null;
}
