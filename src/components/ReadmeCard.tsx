// components/ReadmeCard.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

type Props = { markdown: string; title?: string };

export default function ReadmeCard({ markdown, title = "Purpose" }: Props) {
  return (
    <div className="rounded-2xl bg-[#191a1f] p-5 md:p-6 shadow-lg border border-[#26272b]">
      <div className="prose prose-invert max-w-none prose-p:my-0 prose-strong:text-zinc-100">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
