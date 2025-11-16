// app/margin/components/MarginRiskTable.tsx

"use client";

import { useState } from "react";
import ResolveModal from "./ResolveModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MarginRiskTable() {
  const [openModal, setOpenModal] = useState(false);

  const dummyRows = [
    { acct: "4321", type: "House", amount: "$2,000", equity: "$45,000", maint: "$50,000", shortfall: "$1,000" },
    { acct: "9876", type: "House", amount: "$4,500", equity: "$125,000", maint: "$130,000", shortfall: "$4,500" },
    { acct: "1254", type: "Fed", amount: "$5,500", equity: "$45,000", maint: "$130,000", shortfall: "$1,000" },
    { acct: "4608", type: "House", amount: "$12,000", equity: "$85,000", maint: "$105,000", shortfall: "$4,500" },
    { acct: "4351", type: "House", amount: "$125,000", equity: "$150,000", maint: "$80,000", shortfall: "$1,000" },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">
            Accounts Close to a Margin Call
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Call Amount</TableHead>
                <TableHead>Equity</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Shortfall</TableHead>
                <TableHead>Fix Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.acct}</TableCell>
                  <TableCell className={row.type === "Fed" ? "text-red-400" : ""}>
                    {row.type}
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.equity}</TableCell>
                  <TableCell>{row.maint}</TableCell>
                  <TableCell>{row.shortfall}</TableCell>
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
        </CardContent>
      </Card>
      <ResolveModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
