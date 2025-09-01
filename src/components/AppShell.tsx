// components/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar, { type SectionKey } from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";
import { cn } from "@/lib/utils";

const HEADER_H = 48; // px

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [forceOpen, setForceOpen] = useState<SectionKey | null>(null);
  const SBW = collapsed ? 72 : 272; // <- keep main offset in sync with sidebar

  function handleSidebarToggle() {
    setCollapsed(v => !v);
    setForceOpen(null);
  }

  // Called by Sidebar when a primary is clicked while collapsed
  function handleExpandRequest(section: SectionKey) {
    setCollapsed(false);
    setForceOpen(section);
  }


  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--hh": "48px", // Updated from 56px
          "--sbw": collapsed ? "72px" : "272px",
        } as React.CSSProperties
      }
    >
      <header className="fixed inset-x-0 top-0 z-40 h-[var(--hh)] border-b border-border/50 bg-background/60 backdrop-blur">
        <TopToolbar onToggleCollapsed={handleSidebarToggle} collapsed={collapsed} />
      </header>
      <aside
        className={cn(
          "fixed left-0 top-[var(--hh)] z-30 h-[calc(100vh-var(--hh))] border-r border-sidebar-border bg-background transition-[width] duration-200",
          "nav-scroll" // <--- Added class here
        )}
        style={{ width: "var(--sbw)" }}
      >
        <Sidebar
          collapsed={collapsed}
          onExpandRequest={handleExpandRequest}
          forceOpen={forceOpen}
          onForceOpenHandled={() => setForceOpen(null)}
        />
      </aside>
      <main className="relative z-10 px-4 py-6 transition-[margin-left] duration-200 bg-transparent" style={{ marginLeft: "var(--sbw)", paddingTop: "var(--hh)" }}>
        {children}
      </main>
    </div>
  );
}

    