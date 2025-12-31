
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
  const SBW = collapsed ? 72 : 200;

  function handleSidebarToggle() {
    setCollapsed(v => !v);
    setForceOpen(null);
  }

  function handleExpandRequest(section: SectionKey) {
    setCollapsed(false);
    setForceOpen(section);
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--hh": `${HEADER_H}px`,
          "--sbw": collapsed ? "72px" : "200px",
        } as React.CSSProperties
      }
    >
      {/* --------------------------------------------------------- */}
      {/* TOP NAV — FIXED WITH SUBTLE DIVIDER (NO BRIGHT BORDER)    */}
      {/* --------------------------------------------------------- */}
      <header
        className="fixed inset-x-0 top-0 z-40 h-[var(--hh)] bg-background/60 backdrop-blur"
        data-topbar
      >
        <TopToolbar
          onToggleCollapsed={handleSidebarToggle}
          collapsed={collapsed}
        />
      </header>

      {/* --------------------------------------------------------- */}
      {/* SIDEBAR                                                   */}
      {/* --------------------------------------------------------- */}
      <aside
        className={cn(
          "fixed left-0 top-[var(--hh)] z-30 h-[calc(100vh-var(--hh))] border-r border-sidebar-border bg-background transition-[width] duration-200",
          "nav-scroll"
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

      {/* --------------------------------------------------------- */}
      {/* MAIN CONTENT                                              */}
      {/* --------------------------------------------------------- */}
      <main
        className="relative z-10 p-6 transition-[margin-left] duration-200 bg-transparent"
        style={{
          marginLeft: "var(--sbw)",
          paddingTop: "var(--hh)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
