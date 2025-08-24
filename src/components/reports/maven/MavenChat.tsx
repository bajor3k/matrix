// components/reports/maven/MavenChat.tsx
import * as React from "react";
import { Brain, Send } from "lucide-react";

type Msg = { id: string; who: "user" | "bot"; text: string };

export function MavenChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const newUser: Msg = { id: crypto.randomUUID(), who: "user", text };
    setMsgs((m) => [...m, newUser]);

    // TODO: wire to backend; placeholder bot echo
    const newBot: Msg = {
      id: crypto.randomUUID(),
      who: "bot",
      text: "Thanks — feature hook coming soon.",
    };
    setTimeout(() => setMsgs((m) => [...m, newBot]), 300);

    setInput("");
  };

  const canSend = input.trim().length > 0;

  return (
    <aside className="rounded-2xl border bg-[#101010] border-white/10 light:bg-[#fcfbfb] light:border-black/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 light:border-black/10">
        <div className="flex items-center gap-2 text-white/70 light:text-black/70">
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">Ask Maven</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white light:text-black/60 light:hover:text-black"
          aria-label="Close Ask Maven"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map((m) =>
          m.who === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-xl px-3 py-2 bg-[#08e28f]/15 text-white light:text-black">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex">
              <div className="max-w-[85%] rounded-xl px-3 py-2 bg-white/5 light:bg-black/5 text-white/90 light:text-black/90">
                {m.text}
              </div>
            </div>
          )
        )}
      </div>

      {/* Composer */}
       <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-white/10 light:border-black/10 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fees, accounts, and status…"
          className="flex-1 rounded-xl border border-white/10 bg-[#101010] px-3 py-2 text-sm placeholder:text-white/40 text-white light:bg-[#fcfbfb] light:border-black/10 light:text-black light:placeholder:text-black/40"
        />

        <button
          type="submit"
          disabled={!canSend}
          onClick={handleSend}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
            // neutral pill
            "bg-[#101010] border-white/10 text-white/70 hover:text-white",
            "light:bg-[#fcfbfb] light:border-black/10 light:text-black/70 light:hover:text-black",
            // disabled
            !canSend ? "opacity-50 cursor-not-allowed hover:text-inherit light:hover:text-inherit" : "",
          ].join(" ")}
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>
    </aside>
  );
}
