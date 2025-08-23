// components/reports/InsightsChatCard.tsx
"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

export default function InsightsChatCard({
  onAsk,
  className,
}: {
  onAsk?: (q: string) => void; // hook for later model integration
  className?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Ask a question about this report (fees, accounts, flagged short…). “What’s the average advisory fee?”",
    },
  ]);
  const [q, setQ] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const question = q.trim();
    if (!question) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setQ("");
    // placeholder echo
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Thanks — answering soon. (Hook this to the backend to run your Python/LLM against the merged data.)",
        },
      ]);
    }, 300);

    onAsk?.(question);
  };

  const Suggestion = ({ text }: { text: string }) => (
    <button
      type="button"
      onClick={() => setQ(text)}
      className="text-xs rounded-full border border-white/10 px-3 py-1 text-white/80 hover:bg-white/5"
    >
      {text}
    </button>
  );

  return (
    <section
      className={[
        "rounded-2xl border border-white/10 p-4 md:p-5",
        "bg-white dark:bg-[#101010]",
        className || "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="report-heading text-white/85">Ask about this report</h3>
        <div className="hidden md:flex items-center gap-2">
          <Suggestion text="Which IP has the highest fees?" />
          <Suggestion text="How many accounts are short?" />
          <Suggestion text="Top 5 accounts by value" />
        </div>
      </div>

      <div className="h-[320px] md:h-[360px] rounded-xl border border-white/10 overflow-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-2xl bg-white/5 px-3 py-2"
                : "mr-auto max-w-[85%] rounded-2xl bg-white/10 px-3 py-2"
            }
          >
            <p className="text-sm text-white/90">{m.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question about the data…"
          className="flex-1 rounded-xl bg-black/20 dark:bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
        <button
          type="submit"
          className="btn-secondary"
          title="Send"
          aria-label="Send"
        >
          <Send className="btn-icon" />
          Ask
        </button>
      </form>
    </section>
  );
}
