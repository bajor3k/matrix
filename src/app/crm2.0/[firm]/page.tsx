
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { firmDetails } from "@/data/firms";
import { cn } from "@/lib/utils";
import { CustodianBar } from "@/components/CustodianBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import CrmFooterSection from "@/components/crm/CrmFooterSection";


const tagColors: Record<string, string> = {
  Pershing: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  Schwab: "bg-green-600/20 text-green-300 border-green-500/30",
  Fidelity: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  Goldman: "bg-red-600/20 text-red-300 border-red-500/30",
  PAS: "bg-purple-600/20 text-purple-300 border-purple-500/30",
};

function parseAddress(fullAddress: string) {
  if (!fullAddress) {
    return { street: "", city: "", state: "", zip: "" };
  }
  const parts = fullAddress.split(",");
  if (parts.length < 3) {
    // Return the original string in the street field if parsing fails
    return { street: fullAddress, city: "", state: "", zip: "" };
  }
  const [street, city, rest] = parts;
  const stateZip = rest ? rest.trim().split(" ") : ["", ""];
  const state = stateZip[0] || "";
  const zip = stateZip.slice(1).join(" ") || ""; // Join remaining parts for zip
  
  return {
    street: street.trim(),
    city: city.trim(),
    state: state,
    zip: zip,
  };
}

export default function FirmProfile() {
  const { firm } = useParams();
  const decoded = decodeURIComponent(firm as string);
  const data = firmDetails[decoded as keyof typeof firmDetails];

  if (!data) {
    return (
      <div className="text-foreground p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-4">Firm Not Found</h1>
        <p className="text-muted-foreground">No dummy data exists for this firm yet.</p>
      </div>
    );
  }
  
  const teamMembers = [
    ...(data.advisors || []).map(a => ({ ...a, title: a.title || "Financial Advisor" })),
    ...(data.associates || []).map(a => ({ ...a, title: a.role || "Client Associate" }))
  ];


  return (
    <div className="text-foreground p-6 md:p-10 space-y-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">{decoded}</h1>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.tags.map((tag: string) => (
              <span
                key={tag}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  tagColors[tag] || 'bg-muted border-border'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      

      {/* Firm */}
      <div className="bg-card p-6 rounded-2xl border border-border mt-1">
        <div className="grid grid-cols-8 font-semibold text-muted-foreground pb-3 border-b border-border">
          <div>CRD</div>
          <div>Phone</div>
          <div>Street</div>
          <div>City</div>
          <div>State</div>
          <div>Zip</div>
          <div>Email</div>
          <div>Logo</div>
        </div>
        <div className="grid grid-cols-8 py-3">
          <div>{data.firmInfo.crd}</div>
          <div>{data.firmInfo.phone}</div>
           {(() => {
            const { street, city, state, zip } = parseAddress(data.firmInfo.address ?? "");
            return (
              <>
                <div className="pr-4">{street}</div>
                <div>{city}</div>
                <div>{state}</div>
                <div>{zip}</div>
              </>
            );
          })()}
          <div>{data.firmInfo.email}</div>
          <div></div>
        </div>
      </div>

      {/* NEW CLEAN TEAM CARD (duplicate) */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>CRD</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Tickets</TableHead>
                <TableHead className="text-right">Calls</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {teamMembers.map((member: any) => (
                <TableRow key={member.pin || member.email}>
                  <TableCell className="font-semibold">{member.name}</TableCell>
                  <TableCell>{member.title}</TableCell>
                  <TableCell>{member.pin || "—"}</TableCell>
                  <TableCell>{member.crd || "—"}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-right">
                    {member.tickets ?? Math.floor(Math.random() * 20) +1}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.calls ?? Math.floor(Math.random() * 10) + 1}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Dynamic custodian card section */}
      <div className="mt-10 space-y-3">
        {(data.custodians || []).map((cust: keyof typeof data.codes) => {
          const values = (data.codes as any)?.[cust] ?? [];
          if (values.length === 0) return null;
          return (
            <CustodianBar
              key={cust as string}
              custodian={cust as string}
              values={values}
            />
          );
        })}
      </div>

      <CrmFooterSection
        firm={data}
        custodians={data?.custodians || []}
      />

    </div>
  );
}
