
// components/ReadmeCard.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

type Props = { markdown: string; title?: string };

export default function ReadmeCard({ markdown, title = "README" }: Props) {
  return (
    <div className="rounded-2xl bg-[#191a1f] p-6 shadow-lg border border-zinc-800/60">
      
      <div className="prose prose-invert max-w-none mt-5 prose-p:my-2 prose-li:my-1">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
