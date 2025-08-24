// components/reports/maven/MavenChat.tsx
import * as React from "react";
import { Brain, Send } from "lucide-react";
import { askMaven } from "@/lib/askmaven/ask";

type Msg = { role: "user" | "bot"; text: string };

export function MavenChat({ onClose }: { onClose: () => void }) {
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
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
          placeholder="Ask about fees, accounts, and status…"
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
