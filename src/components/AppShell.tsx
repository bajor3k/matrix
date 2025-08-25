// components/AppShell.tsx
"use client";

import React from 'react';
import Sidebar from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";

const HEADER_H = 56; // px
const SBW = 256;     // sidebar width

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000104] text-zinc-100">
      {/* TOP NAV — full-width */}
      <header
        className="fixed inset-x-0 top-0 z-40 h-14 border-b border-white/10 bg-black/60 backdrop-blur"
        style={{ height: HEADER_H }}
      >
        <TopToolbar />
      </header>

      {/* SIDEBAR — sits directly under the header */}
      <aside
        className="fixed left-0 z-30 h-[calc(100vh-56px)] border-r border-white/10 bg-[#000104]"
        style={{ top: HEADER_H, width: SBW }}
      >
        <Sidebar collapsed={false} />
      </aside>

      {/* MAIN — offset by header height and sidebar width */}
      <main
        className="relative z-10 px-4 py-6"
        style={{ paddingTop: HEADER_H, marginLeft: SBW }}
      >
        {children}
      </main>
    </div>
  );
}
