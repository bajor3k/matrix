
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
    <aside className="rounded-2xl border bg-card/90 dark:bg-[#101010] border-border light:border-black/10 flex flex-col h-full">
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


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-invisible">
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
        className="flex items-center gap-2 border-t border-border/50 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fees, accounts, status..."
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm
               placeholder:text-muted-foreground text-foreground"
        />

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            "bg-background border-border text-muted-foreground hover:text-foreground",
            !canSend && "opacity-50 cursor-not-allowed hover:text-muted-foreground",
          )}
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>
    </aside>
  );
}
