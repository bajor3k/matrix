"use client";

import { useState } from "react";
import { RightSidebar } from "@/components/RightSidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Main Content Wrapper 
        - When sidebar is open, we add 'mr-96' (24rem) to push content left/condense it.
        - The transition ensures it slides smoothly with the sidebar.
      */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "mr-96" : "mr-0"}
        `}
      >
        {children}
      </div>

      {/* The Controlled Sidebar */}
      <RightSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
