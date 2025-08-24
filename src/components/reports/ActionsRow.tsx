// components/reports/ActionsRow.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Download as DownloadIcon, Brain, Loader2 } from "lucide-react";
import { ActionPill } from "@/components/ui/ActionPill";
import { loadKB } from "@/lib/askmaven/storage";

type RunState = "idle" | "running" | "success" | "error";

type Props = {
  filesReady: boolean;
  runState: RunState;
  dashboardVisible: boolean;
  onRun: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
  onToggleDashboard: () => void;
  onAskMaven: () => void;
  kbLoading: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  dashboardVisible,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
  onAskMaven,
  kbLoading,
}: Props) {
  const [kbReady, setKbReady] = useState(false);
  const [kbCount, setKbCount] = useState(0);

  useEffect(() => {
    let alive = true;

    // 1) enable if a KB already exists (e.g., after AskMavenDev.loadSampleKB())
    loadKB().then((kb) => {
      if (!alive) return;
      if (kb?.rows?.length) {
        setKbReady(true);
        setKbCount(kb.rows.length);
      }
    });

    // 2) enable whenever a new KB is indexed
    const onKB = (e: any) => {
      if (!alive) return;
      setKbReady(true);
      setKbCount(e?.detail?.count ?? 0);
    };
    window.addEventListener("askmaven:kb-updated", onKB);

    return () => {
      alive = false;
      window.removeEventListener("askmaven:kb-updated", onKB);
    };
  }, []);

  const isReady = filesReady && runState !== "running" && runState !== "success";
  const isRunning = runState === "running";
  const isSuccess = runState === "success";

  // Determine emphasis for "Run Report"
  let runLabelEmphasis: "normal" | "bright" | "active" = "normal";
  if (isReady) runLabelEmphasis = "bright";
  if (isSuccess) runLabelEmphasis = "active";

  // Determine emphasis for post-run actions
  const postRunLabelEmphasis = isSuccess ? "active" : "normal";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <ActionPill
        onClick={onRun}
        disabled={!isReady}
        isRunning={isRunning && !kbLoading} // Only show primary spinner if not indexing
        label="Run Report"
        srLabel="Run report"
        labelEmphasis={runLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadExcel}
        disabled={!isSuccess}
        label="Excel"
        srLabel="Download Excel"
        title="Download Excel"
        icon={<DownloadIcon className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />

      <ActionPill
        onClick={onDownloadCsv}
        disabled={!isSuccess}
        label="CSV"
        srLabel="Download CSV"
        title="Download CSV"
        icon={<DownloadIcon className="w-4 h-4" />}
        labelEmphasis={postRunLabelEmphasis}
      />

      <ActionPill
        onClick={onToggleDashboard}
        disabled={!isSuccess}
        label={dashboardVisible ? "Hide Dashboard" : "Open Dashboard"}
        srLabel={dashboardVisible ? "Hide dashboard" : "Open dashboard"}
        labelEmphasis={postRunLabelEmphasis}
      />
      <div className="flex items-center gap-2">
        <ActionPill
          onClick={onAskMaven}
          disabled={!kbReady || kbLoading}
          isRunning={kbLoading}
          label="Maven"
          srLabel="Ask Maven"
          title="Ask Maven"
          icon={<Brain className="w-4 h-4" />}
          labelEmphasis={kbReady ? "active" : "normal"}
        />
        {kbReady && !kbLoading && (
          <span className="text-xs text-emerald-400">
            Ready ({kbCount} rows)
          </span>
        )}
      </div>
    </div>
  );
}
