"use client";

import * as React from "react";
import ReportsPageShell from "@/components/reports/ReportsPageShell";
import HelpHeader from "@/components/reports/HelpHeader";
import FullBleed from "@/components/layout/FullBleed";
import UploadBrowse from "@/components/reports/UploadBrowse";
import ExcelTriplePicker from "@/components/reports/ExcelTriplePicker";
import { Button } from "@/components/ui/button";

export default function TestReportPage() {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<{report1?: File; report2?: File; report3?: File}>({});

    const ready = !!(selected.report1 && selected.report2 && selected.report3);

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
                    <UploadBrowse disablePicker onClick={() => setPickerOpen(true)} />
                    <Button className="rounded-full h-9" disabled={!ready}>
                        Run Report
                    </Button>
                    <Button variant="secondary" className="rounded-full h-9">Excel</Button>
                    <Button variant="secondary" className="rounded-full h-9">Key Metrics</Button>
                </div>
            </FullBleed>

             <ExcelTriplePicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                title="SELECT FILES"
                labels={["Household Positions", "Account Activity", "Fee Schedule"]}
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
                           <li>{selected.report1?.name}</li>
                           <li>{selected.report2?.name}</li>
                           <li>{selected.report3?.name}</li>
                        </ul>
                    </div>
                ) : (
                    <p>Please upload the required files to run the report.</p>
                )}
             </div>

        </ReportsPageShell>
    );
}
