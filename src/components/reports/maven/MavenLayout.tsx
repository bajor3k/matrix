// components/reports/maven/MavenLayout.tsx
import * as React from "react";
import { MavenChat } from "./MavenChat";
import ResultsTableCard from "../ResultsTableCard";

type Row = {
    ip: string;
    acct: string;
    value: string;
    fee: string;
    cash: string;
    short: boolean;
};

export function MavenLayout({
  rows,
  onClose,
}: {
  rows: Row[];
  onClose: () => void;
}) {
  return (
    <section
      className={[
        // fill the viewport height just under the app top bar
        "mt-2 h-[calc(100vh-90px)]",
        "grid",
        "grid-cols-[minmax(0,1fr)_minmax(360px,460px)]",
        "gap-4",
      ].join(" ")}
    >
      {/* LEFT: data table area, edge-to-edge */}
      <div className="rounded-2xl border bg-[#101010] border-white/10 overflow-hidden light:bg-white light:border-black/10">
        <ResultsTableCard rows={rows} />
      </div>

      {/* RIGHT: Maven chat panel */}
      <MavenChat onClose={onClose} />
    </section>
  );
}