// components/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";

const HEADER_H = 56; // px

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const SBW = collapsed ? 72 : 272; // Sidebar width changes based on state

  return (
    <div
      className="min-h-screen bg-[#000104] text-zinc-100"
      style={
        {
          "--hh": `${HEADER_H}px`,
          "--sbw": `${SBW}px`,
        } as React.CSSProperties
      }
    >
      {/* TOP NAV — full-width, brain pinned left, no hamburger */}
      <header className="fixed inset-x-0 top-0 z-40 h-[var(--hh)] border-b border-white/10 bg-black/60 backdrop-blur">
        <TopToolbar />
      </header>

      {/* SIDEBAR — sits directly under header, width is dynamic */}
      <aside
        className="fixed left-0 top-[var(--hh)] z-30 h-[calc(100vh-var(--hh))] border-r border-white/10 bg-[#000104] overflow-hidden transition-[width] duration-200"
        style={{ width: "var(--sbw)" }}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(v => !v)} />
      </aside>

      {/* MAIN — offset exactly by sidebar width & header height */}
      <main className="relative z-10 px-4 py-6 transition-[margin-left] duration-200" style={{ marginLeft: "var(--sbw)", paddingTop: "var(--hh)" }}>
        {children}
      </main>
    </div>
  );
}
