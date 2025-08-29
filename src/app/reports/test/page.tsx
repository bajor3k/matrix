"use client";

import * as React from "react";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader from "@/components/reports/HelpHeader";
import FullBleed from "@/components/layout/FullBleed";
import TripleReportModal from "@/components/reports/TripleReportModal";
import { Button } from "@/components/ui/button";

export default function TestReportPage() {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<{positions?: File; activity?: File; fees?: File}>({});

    const ready = !!(selected.positions && selected.activity && selected.fees);

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
                    <Button className="rounded-full h-9" disabled={!ready}>
                        Run Report
                    </Button>
                    <Button variant="secondary" className="rounded-full h-9">Excel</Button>
                    <Button variant="secondary" className="rounded-full h-9">Key Metrics</Button>
                </div>
            </FullBleed>

             <TripleReportModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onComplete={(files) => {
                  setSelected(files);
                }}
              />

             {/* Placeholder for results display */}
             <div className="mt-8 text-center text-muted-foreground">
                {ready ? (
                    <div className="space-y-1">
                        <p>Files are ready to be processed:</p>
                        <ul className="text-xs list-disc list-inside">
                           <li>Positions: {selected.positions?.name}</li>
                           <li>Activity: {selected.activity?.name}</li>
                           <li>Fees: {selected.fees?.name}</li>
                        </ul>
                    </div>
                ) : (
                    <p>Please upload the required files to run the report.</p>
                )}
             </div>

        </ReportsPageShell>
    );
}
