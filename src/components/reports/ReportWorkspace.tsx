// src/components/reports/ReportWorkspace.tsx
"use client";
import React from "react";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  left: React.ReactNode;     // report table/cards
  right: React.ReactNode;    // AskMaven panel
  className?: string;
  isMavenOpen: boolean;
  setIsMavenOpen: (open: boolean) => void;
};

export default function ReportWorkspace({ left, right, className, isMavenOpen, setIsMavenOpen }: Props) {
  return (
    <div className={cn("report-card rounded-2xl p-0 overflow-hidden", className)}>
      <div className="flex min-h-[70vh]">
        {/* LEFT: report content */}
        <div className={cn(
          "flex-1 min-w-0 transition-all duration-300 ease-in-out",
          isMavenOpen ? "w-[calc(100%-400px)]" : "w-full"
        )}>
          <div className="p-4 h-full overflow-y-auto">
            {left}
          </div>
        </div>

        {/* RIGHT: AskMaven panel */}
        <aside
          className={cn(
            "border-l border-white/10 bg-transparent transition-all duration-300 ease-in-out shrink-0",
            isMavenOpen ? "w-[400px] opacity-100" : "w-12 opacity-90"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="h-10 flex items-center justify-between px-3 border-b border-white/10">
              <div className="flex items-center gap-2 overflow-hidden">
                <Brain className="text-zinc-300 text-sm h-4 w-4 shrink-0" />
                {isMavenOpen && <span className="text-zinc-300 text-sm font-medium truncate">Ask Maven</span>}
              </div>
              <button
                aria-label={isMavenOpen ? "Collapse Ask Maven" : "Expand Ask Maven"}
                onClick={() => setIsMavenOpen(!isMavenOpen)}
                className="text-zinc-400 hover:text-zinc-200 text-sm p-1"
              >
                {isMavenOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {isMavenOpen ? (
                <div className="h-full p-3">{right}</div>
              ) : (
                <button
                  className="w-full h-full flex items-center justify-center text-zinc-500 hover:text-zinc-300"
                  onClick={() => setIsMavenOpen(true)}
                  aria-label="Open Ask Maven"
                >
                  <span className="text-xs -rotate-90 whitespace-nowrap">Ask</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
