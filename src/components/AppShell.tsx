
// components/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { TopToolbar } from "./TopToolbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--hh": "56px",
          "--sbw": collapsed ? "72px" : "272px",
        } as React.CSSProperties
      }
    >
      <header className="fixed inset-x-0 top-0 z-40 h-[var(--hh)] border-b border-border bg-background/60 backdrop-blur">
        <TopToolbar onToggleCollapsed={() => setCollapsed(v => !v)} collapsed={collapsed} />
      </header>
      <aside
        className="fixed left-0 top-[var(--hh)] z-30 h-[calc(100vh-var(--hh))] border-r border-border bg-background overflow-hidden transition-[width] duration-200"
        style={{ width: "var(--sbw)" }}
      >
        <Sidebar collapsed={collapsed} />
      </aside>
      <main className="relative z-10 px-4 py-6 transition-[margin-left] duration-200 bg-transparent" style={{ marginLeft: "var(--sbw)", paddingTop: "var(--hh)" }}>
        {children}
      </main>
    </div>
  );
}
