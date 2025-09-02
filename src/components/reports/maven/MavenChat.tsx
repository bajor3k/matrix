
'use client';
import * as React from "react";
import { Brain, Send, X } from "lucide-react";
import { askMaven } from "@/lib/askmaven/ask";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "bot"; text: string };

export function MavenChat({ onClose, hideHeader = false }: { onClose: () => void; hideHeader?: boolean }) {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [chatLoading, setChatLoading] = React.useState(false);
  const [input, setInput] = React.useState("");

  async function handleAsk(question: string) {
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);
    try {
      const { answer } = await askMaven(question);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    } finally {
      setChatLoading(false);
    }
  }

  const canSend = input.trim().length > 0 && !chatLoading;

  return (
    <aside className="report-pane rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 xl:sticky xl:top-20 overflow-hidden flex flex-col">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2 text-foreground/70">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">Ask Maven</span>
            </div>
            <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
            aria-label="Close Ask Maven"
            >
            <X className="h-4 w-4" />
            </button>
        </div>
      )}
      {hideHeader && (
          <div className="text-sm font-semibold opacity-80">Ask Maven</div>
      )}


      {/* Messages */}
       <div className="mt-3 flex-1 report-scroll scroll-invisible pr-1 space-y-2">
        {messages.length === 0 && !chatLoading && (
            <div className="flex justify-start">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm">
                    Ask me a question about the data in this report. For example: "Which accounts are short on cash?"
                </div>
            </div>
        )}
        {messages.map((m, i) => (
            <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
            <div
                className={`p-2 rounded-lg max-w-[85%] text-sm ${m.role === 'user' ? 'bg-neutral-700 text-neutral-100' : 'bg-neutral-800 text-neutral-200'}`}
            >
                {m.text}
            </div>
            </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400 text-sm">
                Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
       <form onSubmit={(e) => {
            e.preventDefault();
            if (!canSend) return;
            handleAsk(input);
            setInput('');
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fees, accounts, status…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none"
        />

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            "shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm",
            !canSend && "opacity-50 cursor-not-allowed",
          )}
        >
          Ask
        </button>
      </form>
    </aside>
  );
}

  