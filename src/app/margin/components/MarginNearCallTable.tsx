// app/margin/components/MarginNearCallTable.tsx

"use client";

import { useState } from "react";
import ResolveModal from "./ResolveModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MarginNearCallTable() {
  const [openModal, setOpenModal] = useState(false);

  const dummyRows = [
    {
      acct: "4321",
      equity: "$45,000",
      maint: "$41,000",
      pct: "9%",
      sma: "$2,000",
      debit: "$12,000",
      risk: "AAPL",
    },
    {
      acct: "9876",
      equity: "$125,000",
      maint: "$120,000",
      pct: "4%",
      sma: "$0",
      debit: "$40,000",
      risk: "TSLA",
    },
    {
      acct: "1254",
      equity: "$45,000",
      maint: "$43,000",
      pct: "5%",
      sma: "$500",
      debit: "$12,000",
      risk: "QQQ",
    },
    {
      acct: "4608",
      equity: "$85,000",
      maint: "$80,000",
      pct: "6%",
      sma: "$0",
      debit: "$20,000",
      risk: "NVDA",
    },
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
                <TableHead>Equity</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>% to Maintenance</TableHead>
                <TableHead>SMA</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Largest Risk</TableHead>
                <TableHead>Fix Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.acct}</TableCell>
                  <TableCell>{row.equity}</TableCell>
                  <TableCell>{row.maint}</TableCell>
                  <TableCell
                    className={`${
                      parseInt(row.pct) <= 5
                        ? "text-red-400"
                        : parseInt(row.pct) <= 10
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {row.pct}
                  </TableCell>
                  <TableCell>{row.sma}</TableCell>
                  <TableCell>{row.debit}</TableCell>
                  <TableCell>{row.risk}</TableCell>
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
