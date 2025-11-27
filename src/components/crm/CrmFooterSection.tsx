
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function CrmFooterSection({ firm, custodians }: { firm: any, custodians: string[] }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log("Selected file:", file.name);
      // You can add file upload logic here
    }
  };
  
  // Determine label for the codes column
  function getCustodianLabel(cust: string) {
    if (cust === "Pershing" || cust === "PAS") return "IP Codes";
    if (cust === "Fidelity") return "G Numbers";
    if (cust === "Schwab") return "Masters";
    if (cust === "Goldman" || cust === "Goldman Sachs") return "Rep Codes";
    return "Codes";
  }

  // Extract codes for each custodian
  const codesByCustodian = custodians.map((c) => ({
    name: c,
    label: getCustodianLabel(c),
    codes: firm?.codes?.[c] || [], // expects something like firm.codes.Pershing = ["1129", "4821"]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

      {/* Column 1 — Custodian Codes */}
      <Card className="bg-card border border-border/10 rounded-xl">
        <CardHeader>
          <CardTitle>Custodian Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content intentionally removed */}
        </CardContent>
      </Card>

      {/* Column 2 — Firm Documents */}
      <Card 
        className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center text-foreground">
             <h2 className="text-xl font-semibold">{firm?.firmInfo?.ip} Documents</h2>
             <ChevronRight className="ml-2 h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Column 3 — Misc Documents */}
      <Card className="bg-card border border-border/10 rounded-xl">
        <CardHeader>
          <CardTitle>Misc Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {/* Content intentionally removed */}
        </CardContent>
      </Card>

    </div>
  );
}
