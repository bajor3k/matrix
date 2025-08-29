
"use client";

import * as React from "react";
import ReportScaffold from "@/components/ReportScaffold";
import UploadBrowse from "@/components/reports/UploadBrowse";
import { SelectReportsModal } from "@/components/reports/SelectReportsModal";
import { Button } from "@/components/ui/button";

export default function TestReportPage() {
    const [open, setOpen] = React.useState(false);
    const [files, setFiles] = React.useState<{report1?: File; report2?: File; report3?: File}>({});

    const [scaffoldFiles, setScaffoldFiles] = React.useState<(File|null)[]>([null, null, null]);

    const handleComplete = (completedFiles: { report1: File; report2: File; report3: File }) => {
        setFiles(completedFiles);
        setScaffoldFiles([completedFiles.report1, completedFiles.report2, completedFiles.report3]);
        // Here you would typically trigger the report run automatically
        // or enable the "Run Report" button.
        console.log("Files selected:", completedFiles);
    };
    
    // This override is a bit of a hack to integrate the modal with the existing scaffold
    // A more robust solution might involve refactoring ReportScaffold to accept files directly
    // or to have a more flexible actions slot.
    const originalScaffold = (
        <ReportScaffold
            reportName="Test"
            summary="This is a test report dashboard. Upload files with columns for 'IP', 'Account Number', 'Value', 'Advisory Fees', and 'Cash' to see the dashboard."
            instructions="Upload up to three XLSX or CSV files below. The data will be merged based on 'IP' and 'Account Number' columns."
            mergeApiPath="/api/reports/test/merge"
            requiredFileCount={3}
        />
    );
    
    // We'll "borrow" the scaffold but control its file state from this page
    const controlledScaffold = React.cloneElement(originalScaffold, {
        // @ts-ignore
        files: scaffoldFiles,
        // We could add more props here to control its behavior if needed
    });

    return (
        <div className="space-y-4">
            {/* The original scaffold handles the display logic, but its internal file state is now controlled from here */}
            {controlledScaffold}

            {/* We overlay our modal logic. We need to find the original browse button and replace its functionality. */}
            <style jsx global>{`
              #reports-root > div:nth-of-type(3) {
                  display: none;
              }
            `}</style>
             <div className="flex justify-center items-center -mt-2">
                <UploadBrowse onClick={() => setOpen(true)} />
             </div>
            
             <SelectReportsModal
                open={open}
                onOpenChange={setOpen}
                onComplete={handleComplete}
             />
        </div>
    );
}
