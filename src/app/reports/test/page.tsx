"use client";

import * as React from "react";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader from "@/components/reports/HelpHeader";
import FullBleed from "@/components/layout/FullBleed";
import ActionsRow from "@/components/reports/ActionsRow";

export default function TestReportPage() {
    const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
    const [activeView, setActiveView] = React.useState<"maven" | "key-metrics">("maven");

    const handleRunReport = (files?: { report1: File; report2: File; report3: File }) => {
        if (!files) return;
        console.log("Running report with files:", files);
        setRunState("running");
        // Simulate API call
        setTimeout(() => {
            setRunState("success");
        }, 1500);
    };

    return (
        <ReportsPageShell>
            <FullBleed>
                <HelpHeader 
                    summary="This is a test report dashboard. Upload files with columns for 'IP', 'Account Number', 'Value', 'Advisory Fees', and 'Cash' to see the dashboard."
                    instructions="Upload up to three XLSX or CSV files below. The data will be merged based on 'IP' and 'Account Number' columns."
                />
            </FullBleed>

            <FullBleed>
                 <ActionsRow
                    filesReady={true} // The modal inside ActionsRow handles file readiness
                    runState={runState}
                    activeView={activeView}
                    onRun={handleRunReport}
                    onDownloadExcel={() => console.log("Download Excel clicked")}
                    onToggleKeyMetrics={() => setActiveView(p => p === 'key-metrics' ? 'maven' : 'key-metrics')}
                 />
            </FullBleed>

             {/* Placeholder for results display */}
             <div className="mt-8 text-center text-muted-foreground">
                {runState === 'idle' && <p>Please upload files via the 'Download' button to run the report.</p>}
                {runState === 'running' && <p>Report is running...</p>}
                {runState === 'success' && <p>Report ran successfully. View results in the table or ask Maven.</p>}
             </div>
        </ReportsPageShell>
    );
}
