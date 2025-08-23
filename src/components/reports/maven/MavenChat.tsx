// components/reports/maven/MavenChat.tsx
import * as React from "react";
import { Brain } from "lucide-react";

type Msg = { id: string; who: "user" | "bot"; text: string };

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d="M8.5 4.5a2.5 2.5 0 0 0-2.5 2.5v1a2.5 2.5 0 0 0-2 2.45V12a3 3 0 0 0 3 3h1M15.5 4.5A2.5 2.5 0 0 1 18 7v1a2.5 2.5 0 0 1 2 2.45V12a3 3 0 0 1-3 3h-1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 9.5c0-1.1.9-2 2-2h1v8h-1a2 2 0 0 1-2-2v-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 9.5c0-1.1-.9-2-2-2h-1v8h1a2 2 0 0 0 2-2v-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

export function MavenChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");

  const send = () => {
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

  return (
    <aside className="rounded-2xl border bg-[#101010] border-white/10 light:bg-[#fcfbfb] light:border-black/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 light:border-black/10">
        <div className="flex items-center gap-2">
          <BrainIcon className="h-5 w-5 text-[#08e28f]" />
          <span className="font-medium text-white light:text-black">Ask Maven</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-white/70 hover:text-white light:text-black/70 light:hover:text-black"
          aria-label="Close Maven"
          title="Close (Esc)"
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
          send();
        }}
        className="flex items-center gap-2 p-3 border-t border-white/10 light:border-black/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fees, accounts, and short flags…"
          className="flex-1 rounded-full bg-white/5 light:bg-black/5 px-4 py-2 text-white placeholder-white/40 focus:outline-none light:text-black light:placeholder-black/40"
        />
        <button
          type="submit"
          className="rounded-full bg-[#08e28f] text-black font-medium px-4 py-2 disabled:opacity-40"
          disabled={!input.trim()}
        >
          Ask
        </button>
      </form>
    </aside>
  );
}