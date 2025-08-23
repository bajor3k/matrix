// components/reports/InsightsChatCard.tsx
import React from "react";
import { Send } from "lucide-react";

export default function InsightsChatCard({
  className,
  messages = [],
  onAsk,
}: {
  className?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  onAsk?: (q: string) => void;
}) {
  const [q, setQ] = React.useState("");

  return (
    <section
      className={[
        "rounded-2xl border",
        "bg-white dark:bg-[#101010]",
        "border-[#e5e7eb] dark:border-white/10",
        "p-3 md:p-4 flex flex-col",
        className || "",
      ].join(" ")}
      aria-label="Ask about this report"
    >
      {/* Scrollable message area */}
      <div className="flex-1 overflow-auto space-y-3 md:space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="text-sm md:text-base text-black/60 dark:text-white/60">
            Ask a question about the report (fees, accounts, flagged short, etc.).
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={[
                "max-w-[90%] md:max-w-[80%] rounded-xl px-3.5 py-2.5",
                m.role === "user"
                  ? "ml-auto bg-[#f2f3f5] text-[#111827] dark:bg-[#171717] dark:text-white"
                  : "mr-auto bg-[#fcfbfb] text-[#111827] dark:bg-[#121212] dark:text-white",
                "border border-[#e5e7eb] dark:border-white/10",
              ].join(" ")}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form
        className="mt-3 md:mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          onAsk?.(q.trim());
          setQ("");
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question about the data…"
          className="
            flex-1 rounded-xl h-11 md:h-12 px-3 md:px-4
            bg-white dark:bg-[#0f0f0f]
            text-[#111827] dark:text-white
            placeholder-black/55 dark:placeholder-white/60
            border border-[#e5e7eb] dark:border-white/10
            outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
          "
        />
        <button
          type="submit"
          aria-label="Ask"
          className="
            inline-flex items-center gap-2 rounded-full h-11 md:h-12 px-4
            bg-black/85 text-white dark:bg-white/10 dark:text-white
            hover:bg-black dark:hover:bg-white/15
            border border-black/10 dark:border-white/10
            disabled:opacity-55 disabled:cursor-not-allowed
          "
          disabled={!q.trim()}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </section>
  );
}
