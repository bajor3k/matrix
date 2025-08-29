// app/reports/test/page.tsx
"use client";

import * as React from "react";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader from "@/components/reports/HelpHeader";
import FullBleed from "@/components/layout/FullBleed";
import ActionsRow from "@/components/reports/ActionsRow";
import { runTestReport, type TestReportFiles } from "@/utils/reports/test/runTestReport";

export default function TestReportPage() {
    const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
    const [activeView, setActiveView] = React.useState<"maven" | "key-metrics">("maven");

     const handleRun = async (files: TestReportFiles) => {
        setRunState("running");
        try {
            const result = await runTestReport(files);
            console.log("Test report run result:", result);
            setRunState("success");
        } catch(e) {
            console.error("Failed to run test report", e);
            setRunState("error");
        }
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
                    onRun={handleRun}
                 />
            </FullBleed>

             {/* Placeholder for results display */}
             <div className="mt-8 text-center text-muted-foreground">
                {runState === 'idle' && <p>Please upload files via the 'Download' button to run the report.</p>}
                {runState === 'running' && <p>Report is running...</p>}
                {runState === 'success' && <p>Report ran successfully. View results in the table or ask Maven.</p>}
                {runState === 'error' && <p className="text-red-400">An error occurred while running the report.</p>}
             </div>
        </ReportsPageShell>
    );
}
