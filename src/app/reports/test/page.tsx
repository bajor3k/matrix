"use client";

import * as React from "react";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader from "@/components/reports/HelpHeader";
import FullBleed from "@/components/layout/FullBleed";
import UploadBrowse from "@/components/reports/UploadBrowse";
import ThreeFileUploadModal from "@/components/reports/ThreeFileUploadModal";
import { Button } from "@/components/ui/button";

export default function TestReportPage() {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [files, setFiles] = React.useState<{ report1?: File; report2?: File; report3?: File }>({});

    const handleComplete = (completedFiles: { report1: File; report2: File; report3: File }) => {
        setFiles(completedFiles);
        // You can trigger the report run automatically here or enable the "Run Report" button.
        console.log("Files selected:", completedFiles);
    };

    const filesReady = !!(files.report1 && files.report2 && files.report3);

    return (
        <ReportsPageShell>
            <FullBleed>
                <HelpHeader 
                    summary="This is a test report dashboard. Upload files with columns for 'IP', 'Account Number', 'Value', 'Advisory Fees', and 'Cash' to see the dashboard."
                    instructions="Upload up to three XLSX or CSV files below. The data will be merged based on 'IP' and 'Account Number' columns."
                />
            </FullBleed>

            <FullBleed>
                 <div className="flex items-center justify-center gap-2 mt-4">
                    <UploadBrowse onClick={() => setModalOpen(true)} />
                    <Button className="rounded-full h-9" disabled={!filesReady}>
                        Run Report
                    </Button>
                    <Button variant="secondary" className="rounded-full h-9">Excel</Button>
                    <Button variant="secondary" className="rounded-full h-9">Key Metrics</Button>
                </div>
            </FullBleed>

             <ThreeFileUploadModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                labels={["Household Positions", "Account Activity", "Fee Schedule"]}
                onComplete={handleComplete}
             />

             {/* Placeholder for results display */}
             <div className="mt-8 text-center text-muted-foreground">
                {filesReady ? (
                    <div className="space-y-1">
                        <p>Files are ready to be processed:</p>
                        <ul className="text-xs list-disc list-inside">
                           <li>{files.report1?.name}</li>
                           <li>{files.report2?.name}</li>
                           <li>{files.report3?.name}</li>
                        </ul>
                    </div>
                ) : (
                    <p>Please upload the required files to run the report.</p>
                )}
             </div>

        </ReportsPageShell>
    );
}
