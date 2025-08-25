// components/AppShell.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";

const HEADER_H = 56; // px
const SBW = 256;     // sidebar width

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#000104] text-zinc-100"
      style={
        {
          // header height + sidebar width (includes inner padding)
          // feel free to tweak widths later in one place
          ["--hh" as any]: "56px",
          ["--sbw" as any]: "272px", // 256 content + 16px inner padding
        } as React.CSSProperties
      }
    >
      {/* TOP NAV — full-width, brain pinned left, no hamburger */}
      <header className="fixed inset-x-0 top-0 z-40 h-[var(--hh)] border-b border-white/10 bg-black/60 backdrop-blur">
        <TopToolbar />
      </header>

      {/* SIDEBAR — sits directly under header, fixed width */}
      <aside
        className="fixed left-0 top-[var(--hh)] z-30 h-[calc(100vh-var(--hh))] border-r border-white/10 bg-[#000104] overflow-x-hidden"
        style={{ width: "var(--sbw)" }}
      >
        <Sidebar />
      </aside>

      {/* MAIN — offset exactly by sidebar width & header height */}
      <main className="relative z-10 px-4 py-6" style={{ marginLeft: "var(--sbw)", paddingTop: "var(--hh)" }}>
        {children}
      </main>
    </div>
  );
}
