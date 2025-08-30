// components/reports/HelpHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";

const LS_KEY = "reports.help.dismissed";

export default function HelpHeader({
  summary,
  instructions,
  onDismissManual, // optional hook if parent wants to know
}: {
  summary: string | React.ReactNode;
  instructions: React.ReactNode; // can be lists/links
  onDismissManual?: () => void;
}) {
  const [dismissed, setDismissed] = useState(true); // Start as dismissed to avoid SSR flicker
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setDismissed(localStorage.getItem(LS_KEY) === "1"); } catch {}
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(LS_KEY, "1"); } catch {}
    onDismissManual?.();
  };

  return (
    <div className="space-y-3 mt-3">
      {/* Slim Help bar */}
      {!dismissed && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm bg-card border-border dark:bg-[#0c0c0c] dark:border-card-border-subtle"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Need a refresher on this report?</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="underline underline-offset-2 text-[#08e28f] hover:opacity-90"
            >
              View instructions
            </button>
            <button
              onClick={dismiss}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Don’t show again"
            >
              Hide
            </button>
          </div>
        </div>
      )}

      {/* Collapsible full details */}
      <details
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-2xl details-no-marker bg-card dark:bg-[#0c0c0c] border border-border dark:border-card-border-subtle"
      >
        <summary className="cursor-pointer px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">How this report works</div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{open ? "Hide" : "Show"}</span>
        </summary>

        <div className="px-5 pb-5 space-y-4">
          <section>
            <h3 className="report-heading text-gray-900 dark:text-gray-100 mb-2">Report Summary</h3>
            <div className="report-copy text-gray-700 dark:text-gray-300">{summary}</div>
          </section>

          <section>
            <h3 className="report-heading text-gray-900 dark:text-gray-100 mb-2">Instructions</h3>
            <div className="report-copy text-gray-700 dark:text-gray-300">{instructions}</div>
          </section>
        </div>
      </details>
    </div>
  );
}

/* Helper for parent components:
   Call helpHeaderAutoDismiss() after the first successful upload to hide the slim bar forever. */
export function helpHeaderAutoDismiss() {
  try { localStorage.setItem("reports.help.dismissed", "1"); } catch {}
}
