// src/components/icons/BrainIcon.tsx
import * as React from "react";

export function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 3.5a3 3 0 0 0-3 3v.5a3 3 0 0 0-2 2.8v.2a3 3 0 0 0 1.7 2.7A3.5 3.5 0 0 0 7 16.9V19a2.5 2.5 0 0 0 2.5 2.5M15.5 3.5a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 2.8v.2a3 3 0 0 1-1.7 2.7 3.5 3.5 0 0 1-1.8 4.2V19A2.5 2.5 0 0 1 14.5 21.5M12 2.5V22.5" />
    </svg>
  );
}
