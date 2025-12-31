"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, File, Search } from "lucide-react";

const teamProcedures = [
  {
    team: "Advisor Services",
    files: [
      { name: "New Account Opening Guide", type: "pdf", date: "2024-01-15" },
      { name: "Client Onboarding Checklist", type: "word", date: "2023-12-10" },
    ],
  },
  {
    team: "Principal Review Desk",
    files: [
      { name: "Trade Review Guidelines", type: "pdf", date: "2024-02-01" },
    ],
  },
  {
    team: "Asset Movement",
    files: [
      { name: "Wire Transfer Request Form", type: "pdf", date: "2023-11-20" },
      { name: "ACAT Transfer Procedures", type: "word", date: "2023-10-05" },
    ],
  },
  {
    team: "Compliance",
    files: [
      { name: "Annual Compliance Meeting Presentation", type: "pptx", date: "2024-01-10" },
      { name: "Gift & Gratuity Log", type: "excel", date: "2024-01-01" },
    ],
  },
  {
    team: "Direct Business",
    files: [
      { name: "Direct Application Processing", type: "pdf", date: "2023-09-15" },
    ],
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "excel": return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "word": return <FileText className="h-5 w-5 text-blue-500" />;
    default: return <File className="h-5 w-5 text-gray-500" />;
  }
};

export default function ProceduresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcedures = teamProcedures.map((team) => {
    if (team.team.toLowerCase().includes(searchTerm.toLowerCase())) {
      return team;
    }
    const matchingFiles = team.files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchingFiles.length > 0 ? { ...team, files: matchingFiles } : null;
  }).filter(Boolean);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Procedures</h1>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search procedures..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {filteredProcedures.length > 0 ? (
              filteredProcedures.map((team, index) => (
                <AccordionItem key={team.team} value={`item-${index}`} className="px-6">
                  <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline hover:text-primary transition-colors">
                    {team.team}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-1">
                      {team.files.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-sm text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{file.type} • Updated {file.date}</p>
                            </div>
                          </div>
                          <button className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No procedures found matching "{searchTerm}"
              </div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
