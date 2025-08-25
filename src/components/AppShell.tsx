
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);          // desktop expanded by default
  const [mobile, setMobile] = useState(false);     // mobile drawer state

  const SBW = open ? 256 : 72; // px

  return (
    <div className="min-h-screen bg-[#000104] text-zinc-100 overflow-x-hidden">
      {/* Sidebar (fixed) */}
      <Sidebar
        collapsed={!open}
        className="fixed left-0 top-0 z-20 h-screen"
        onNavigate={() => setMobile(false)}
      />

      {/* Top bar */}
      <header
        className="sticky top-0 z-30 h-12 flex items-center gap-2 border-b border-white/10 bg-black/40 backdrop-blur px-3"
        style={{ marginLeft: SBW, width: `calc(100% - ${SBW}px)` }}
      >
        <button
          className="lg:hidden rounded-lg p-2 hover:bg-white/10"
          onClick={() => setMobile(v => !v)}
        >
          {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <button
          className="hidden lg:inline-flex rounded-lg p-2 hover:bg-white/10"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-grow">
          <TopToolbar />
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobile && (
        <div
          className="fixed inset-0 z-10 bg-black/60 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}

      {/* Main content */}
      <main
        className="relative z-10 px-4 py-4"
        style={{ marginLeft: SBW, width: `calc(100% - ${SBW}px)`, transition: 'margin-left 200ms ease-in-out, width 200ms ease-in-out' }}
      >
        {children}
      </main>
    </div>
  );
}
