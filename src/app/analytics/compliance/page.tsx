
"use client";

import * as React from "react";
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Repeat as RepeatIcon, UserX, Activity, Filter, CalendarDays, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FlaggedActivity {
  id: string;
  accountNumber: string;
  accountType: "Managed" | "Non-Managed";
  tradesLast30Days: number;
  daysSinceLastTrade: number | null;
  complianceFlag: "Excessive Trading" | "No Activity" | "Trade Frequency Anomaly";
  aiSuggestion: string;
}

const summaryCardsData = [
  { title: "Total Flagged Accounts", value: "12", icon: ShieldAlert, iconClassName: "text-red-400" },
  { title: "Excessive Trading", value: "3", icon: RepeatIcon, iconClassName: "text-red-400" },
  { title: "No Activity", value: "4", icon: UserX, iconClassName: "text-green-400" },
  { title: "Trade Frequency Anomalies", value: "5", icon: Activity, iconClassName: "text-purple-400" },
];

const getFlagBadgeClassName = (flag: FlaggedActivity["complianceFlag"]): string => {
    const baseClasses = "text-white font-bold border-transparent whitespace-nowrap";
    switch (flag) {
      case "Excessive Trading":
        return `${baseClasses} bg-red-600 animate-glow-trading`;
      case "Trade Frequency Anomaly":
        return `${baseClasses} bg-[#A259F7] animate-glow-anomaly`;
      case "No Activity":
        return `${baseClasses} bg-green-500 animate-glow-activity`;
      default:
        return "bg-slate-500/20 border-slate-500/50 text-slate-400";
    }
  };


export default function ComplianceMatrixPage() {
  const [flaggedActivityData, setFlaggedActivityData] = React.useState<FlaggedActivity[]>([]);

  React.useEffect(() => {
    // Helper to generate unique 6-digit numbers, specific to this effect
    const generatedNumbers = new Set<string>();
    const generateUniqueSuffix = (): string => {
      let suffix;
      do {
        suffix = Math.floor(100000 + Math.random() * 900000).toString();
      } while (generatedNumbers.has(suffix));
      generatedNumbers.add(suffix);
      return suffix;
    };

    const initialData: Omit<FlaggedActivity, 'accountNumber'>[] = [
      { id: "fa1", accountType: "Non-Managed", tradesLast30Days: 152, daysSinceLastTrade: 1, complianceFlag: "Excessive Trading", aiSuggestion: "Review trading activity against client's risk profile and IPS." },
      { id: "fa2", accountType: "Managed", tradesLast30Days: 0, daysSinceLastTrade: 45, complianceFlag: "No Activity", aiSuggestion: "Contact client to discuss portfolio and reconfirm investment objectives." },
      { id: "fa3", accountType: "Non-Managed", tradesLast30Days: 5, daysSinceLastTrade: 3, complianceFlag: "Trade Frequency Anomaly", aiSuggestion: "Verify trades align with recent market news or client instructions." },
      { id: "fa4", accountType: "Managed", tradesLast30Days: 0, daysSinceLastTrade: 62, complianceFlag: "No Activity", aiSuggestion: "Schedule portfolio review; ensure strategy alignment." },
      { id: "fa5", accountType: "Non-Managed", tradesLast30Days: 98, daysSinceLastTrade: 2, complianceFlag: "Excessive Trading", aiSuggestion: "Assess if self-directed trading aligns with stated goals." },
      { id: "fa6", accountType: "Managed", tradesLast30Days: 10, daysSinceLastTrade: 5, complianceFlag: "Trade Frequency Anomaly", aiSuggestion: "Review account holdings (e.g., Leveraged ETFs) against the client's stated conservative risk tolerance. Document suitability or reposition." },
      { id: "fa7", accountType: "Managed", tradesLast30Days: 2, daysSinceLastTrade: 80, complianceFlag: "No Activity", aiSuggestion: "Client nearing RMD age. Verify account activity expectations and confirm objectives." },
      { id: "fa8", accountType: "Non-Managed", tradesLast30Days: 200, daysSinceLastTrade: 1, complianceFlag: "Excessive Trading", aiSuggestion: "High trading volume. Cross-reference with documented strategy and risk profile." },
      { id: "fa9", accountType: "Managed", tradesLast30Days: 1, daysSinceLastTrade: 15, complianceFlag: "Trade Frequency Anomaly", aiSuggestion: "Account holds highly speculative assets inconsistent with 'Education Fund' goal. Review IPS and realign strategy." },
      { id: "fa10", accountType: "Managed", tradesLast30Days: 15, daysSinceLastTrade: 2, complianceFlag: "Trade Frequency Anomaly", aiSuggestion: "Recent shift to high-frequency, small-cap trades. Verify if this aligns with a recent change in client strategy or IPS." },
      { id: "fa11", accountType: "Managed", tradesLast30Days: 0, daysSinceLastTrade: 95, complianceFlag: "No Activity", aiSuggestion: "Extended period of no activity in a balanced portfolio. Initiate client contact for review." },
      { id: "fa12", accountType: "Managed", tradesLast30Days: 7, daysSinceLastTrade: 8, complianceFlag: "Trade Frequency Anomaly", aiSuggestion: "Portfolio includes non-income generating, high-volatility crypto assets. Re-evaluate suitability for income objective." }
    ];
    
    const dataWithAccountNumbers = initialData.map(item => ({
        ...item,
        accountNumber: item.accountType === "Managed" ? `XYZ${generateUniqueSuffix()}` : `ABC${generateUniqueSuffix()}`
    }));

    setFlaggedActivityData(dataWithAccountNumbers);
  }, []);


  const displayedActivities = flaggedActivityData.slice(0, 10);

  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Compliance Matrix</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCardsData.map((card, index) => (
          <PlaceholderCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
          />
        ))}
      </div>

      <PlaceholderCard title="Flagged Activity">
        <div className="flex flex-wrap gap-4 mb-4 items-center">
            <Select defaultValue="all_flags">
                <SelectTrigger className="w-full sm:w-auto bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
                <SelectValue placeholder="Filter by Flag Type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all_flags">All Flags</SelectItem>
                <SelectItem value="excessive_trading">Excessive Trading</SelectItem>
                <SelectItem value="no_activity">No Activity</SelectItem>
                <SelectItem value="trade_frequency">Trade Frequency Anomaly</SelectItem>
                </SelectContent>
            </Select>
             <Select defaultValue="all_accounts">
                <SelectTrigger className="w-full sm:w-auto bg-card border-none text-foreground shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out">
                <SelectValue placeholder="Filter by Account Type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all_accounts">All Account Types</SelectItem>
                <SelectItem value="managed">Managed</SelectItem>
                <SelectItem value="non_managed">Non-Managed</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
                <CalendarDays className="mr-2 h-4 w-4" /> Date Range
            </Button>
             <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> More Filters
            </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead className="text-right">Trades (30d)</TableHead>
              <TableHead className="text-right">Days Since Last Trade</TableHead>
              <TableHead>Compliance Flag</TableHead>
              <TableHead>AI Suggestion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.accountNumber}</TableCell>
                <TableCell>{activity.accountType}</TableCell>
                <TableCell className="text-right">{activity.tradesLast30Days}</TableCell>
                <TableCell className="text-right">{activity.daysSinceLastTrade === null ? "N/A" : activity.daysSinceLastTrade}</TableCell>
                <TableCell>
                  <Badge className={getFlagBadgeClassName(activity.complianceFlag)}>
                    {activity.complianceFlag}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{activity.aiSuggestion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PlaceholderCard>

    </main>
  );
}
