
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { CustodianCard } from "@/components/CustodianCard";

export default function CrmFooterSection({ firm, custodians }: { firm: any, custodians: string[] }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const miscFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMiscCardClick = () => {
    miscFileInputRef.current?.click();
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        {/* Column 1 — Custodian Codes */}
        <Card 
          className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <div className="flex items-center text-foreground">
              <h2 className="text-xl font-semibold">Custodian Codes</h2>
              <ChevronRight className="ml-2 h-6 w-6" />
            </div>
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
        <Card 
          className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={handleMiscCardClick}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <input
              type="file"
              ref={miscFileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center text-foreground">
              <h2 className="text-xl font-semibold">Misc Documents</h2>
              <ChevronRight className="ml-2 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-black border-border/50">
          <DialogHeader>
            <DialogTitle>Custodian Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {codesByCustodian.map(custodian => (
              <CustodianCard
                key={custodian.name}
                custodian={custodian.name}
                label={custodian.label}
                values={custodian.codes}
              />
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
