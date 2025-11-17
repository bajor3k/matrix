// app/margin/components/MarginCallTable.tsx

"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import ResolveModal from "./ResolveModal";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";


export default function MarginCallTable() {
  const [openModal, setOpenModal] = useState(false);

  // Dummy active margin calls
  const activeCalls = [
    {
      acct: "2001",
      type: "House",
      callAmount: "$2,000",
      equity: "$38,000",
      maint: "$40,000",
      deadline: "T+3",
    },
    {
      acct: "2002",
      type: "Fed",
      callAmount: "$5,500",
      equity: "$45,000",
      maint: "$50,500",
      deadline: "T+1",
    },
    {
      acct: "2003",
      type: "House",
      callAmount: "$1,250",
      equity: "$28,750",
      maint: "$30,000",
      deadline: "T+2",
    },
  ];

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(activeCalls);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Calls");
    XLSX.writeFile(workbook, "accounts_in_margin_call.xlsx");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Accounts in Margin Call
          </CardTitle>
        </div>

        <Button
          onClick={downloadExcel}
          variant="outline"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Call Amount</TableHead>
                <TableHead>Equity</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Fix Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCalls.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.acct}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.callAmount}</TableCell>
                  <TableCell>{row.equity}</TableCell>
                  <TableCell>{row.maint}</TableCell>
                  <TableCell>{row.deadline}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenModal(true)}
                    >
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ResolveModal open={openModal} onClose={() => setOpenModal(false)} />
      </CardContent>
    </Card>
  );
}
