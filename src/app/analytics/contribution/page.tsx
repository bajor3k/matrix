
"use client";

import * as React from "react";
import { Download, TrendingUp, MessageSquare, Loader2, AlertTriangle, PieChart } from 'lucide-react';
import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ProgressDonut from "@/components/ui/ProgressDonut";
import { AccountTypeProgressRing } from "@/components/charts/account-type-progress-ring"; 
import { useToast } from "@/hooks/use-toast";
import { downloadTableExcel } from "@/lib/downloadTableExcel";

type AccountType = 'Traditional IRA' | 'Roth IRA' | 'SEP IRA' | 'SIMPLE IRA';

interface ContributionAccount {
  id: string;
  accountName: string; // Will now store XYZ123456 format
  originalAccountName?: string; // For tooltip
  accountType: AccountType;
  annualLimit: number;
  amountContributed: number;
  dueDate: string; // YYYY-MM-DD format
}

const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return format(date, 'yyyy-MM-dd');
};

const calculateMonthsLeft = (): number => {
  const currentMonth = new Date().getMonth(); 
  return Math.max(1, 12 - (currentMonth + 1)); 
};

interface DueDateInfo {
  mainDisplay: string;
  tooltipDate: string;
  boxClassName: string;
  pulseClassName: string;
}

const getDueDateInfo = (dueDateString: string): DueDateInfo => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const parsedDueDate = parseISO(dueDateString);

  if (!isValid(parsedDueDate)) {
    return { mainDisplay: "N/A", tooltipDate: "Invalid Date", boxClassName: "bg-gray-400 text-black", pulseClassName: "" };
  }
  
  parsedDueDate.setHours(0,0,0,0); 

  const daysRemaining = differenceInDays(parsedDueDate, today);
  let mainDisplay: string;
  let boxClassName: string;
  let pulseClassName = "";

  if (daysRemaining < 0) {
    mainDisplay = `${Math.abs(daysRemaining)}d past`;
    boxClassName = "bg-red-500 text-white";
    pulseClassName = "due-pulse";
  } else if (daysRemaining === 0) {
    mainDisplay = "Today";
    boxClassName = "bg-red-500 text-white";
    pulseClassName = "due-pulse";
  } else if (daysRemaining <= 5) {
    mainDisplay = `${daysRemaining}d left`;
    boxClassName = "bg-red-500 text-white";
    pulseClassName = "due-pulse";
  } else if (daysRemaining < 15) { 
    mainDisplay = `${daysRemaining}d left`;
    boxClassName = "bg-red-500 text-white"; 
  } else if (daysRemaining <= 45) { 
    mainDisplay = `${daysRemaining}d left`;
    boxClassName = "bg-yellow-400 text-black";
  } else { 
    mainDisplay = `${daysRemaining}d left`;
    boxClassName = "bg-green-500 text-white";
  }

  return {
    mainDisplay,
    tooltipDate: format(parsedDueDate, "MMM dd, yyyy"),
    boxClassName,
    pulseClassName,
  };
};

const MOCK_FEE_RATE = 0.01; 

const IRA_TYPES_ORDER: AccountType[] = ['Roth IRA', 'Traditional IRA', 'SEP IRA', 'SIMPLE IRA'];


export default function ContributionMatrixPage() {
  const [accounts, setAccounts] = React.useState<ContributionAccount[]>([]);
  const [monthsLeft, setMonthsLeft] = React.useState(0);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const generateRandomAccountNumber = (): string => {
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      return `XYZ${randomNumber}`;
    };

    const usedAccountNumbers = new Set<string>();
    const generateUniqueAccountNumber = (): string => {
      let accountNumber;
      do {
        accountNumber = generateRandomAccountNumber();
      } while (usedAccountNumbers.has(accountNumber));
      usedAccountNumbers.add(accountNumber);
      return accountNumber;
    };

    const initialContributionAccounts: ContributionAccount[] = [
      { id: "1", accountName: generateUniqueAccountNumber(), originalAccountName: "John's Primary Roth", accountType: "Roth IRA", annualLimit: 7000, amountContributed: 3500, dueDate: getFutureDate(3) },
      { id: "2", accountName: generateUniqueAccountNumber(), originalAccountName: "Jane's Traditional", accountType: "Traditional IRA", annualLimit: 7000, amountContributed: 7000, dueDate: getFutureDate(25) },
      { id: "3", accountName: generateUniqueAccountNumber(), originalAccountName: "Business SEP", accountType: "SEP IRA", annualLimit: 66000, amountContributed: 25000, dueDate: getFutureDate(60) },
      { id: "4", accountName: generateUniqueAccountNumber(), originalAccountName: "Side Gig SIMPLE", accountType: "SIMPLE IRA", annualLimit: 16000, amountContributed: 8000, dueDate: getFutureDate(-5) },
      { id: "5", accountName: generateUniqueAccountNumber(), originalAccountName: "John's Rollover IRA", accountType: "Traditional IRA", annualLimit: 7000, amountContributed: 1000, dueDate: getFutureDate(90) },
      { id: "6", accountName: generateUniqueAccountNumber(), originalAccountName: "Spouse Roth", accountType: "Roth IRA", annualLimit: 7000, amountContributed: 0, dueDate: getFutureDate(1) },
      { id: "7", accountName: generateUniqueAccountNumber(), originalAccountName: "Emergency Fund IRA", accountType: "Traditional IRA", annualLimit: 7000, amountContributed: 3000, dueDate: getFutureDate(0) },
      { id: "8", accountName: generateUniqueAccountNumber(), originalAccountName: "College Fund IRA", accountType: "Roth IRA", annualLimit: 7000, amountContributed: 1500, dueDate: getFutureDate(14) },
      { id: "9", accountName: generateUniqueAccountNumber(), originalAccountName: "Retirement Plus", accountType: "SEP IRA", annualLimit: 66000, amountContributed: 60000, dueDate: getFutureDate(40) },
      { id: "10", accountName: generateUniqueAccountNumber(), originalAccountName: "Travel Savings IRA", accountType: "Traditional IRA", annualLimit: 7000, amountContributed: 500, dueDate: getFutureDate(180) },
    ];
    setAccounts(initialContributionAccounts);
    setMonthsLeft(calculateMonthsLeft());
  }, []);

  const handleDownload = async () => {
    if (!tableRef.current) {
      toast({
        title: "Error",
        description: "Could not find the table to export.",
        variant: "destructive",
      });
      return;
    }
    try {
      await downloadTableExcel({
        table: tableRef.current,
        fileName: "ira_contribution_overview",
        sheetName: "IRA Contributions",
      });
      toast({
        title: "Download Started",
        description: "Your Excel file is being generated.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem exporting the data to Excel.",
        variant: "destructive",
      });
    }
  };


  const aggregatedDataByType = React.useMemo(() => {
    if (accounts.length === 0) return [];
    const result: Record<AccountType, { 
      totalRemaining: number; 
      totalOpportunity: number; 
      totalLimit: number;
      totalContributed: number;
      icon: any; // Add icon to the type
      iconClassName: string;
    }> = {
      "Roth IRA": { totalRemaining: 0, totalOpportunity: 0, totalLimit: 0, totalContributed: 0, icon: PieChart, iconClassName: "text-[hsl(var(--chart-2))]" },
      "Traditional IRA": { totalRemaining: 0, totalOpportunity: 0, totalLimit: 0, totalContributed: 0, icon: PieChart, iconClassName: "text-[hsl(var(--chart-1))]" },
      "SEP IRA": { totalRemaining: 0, totalOpportunity: 0, totalLimit: 0, totalContributed: 0, icon: PieChart, iconClassName: "text-[hsl(var(--chart-3))]" },
      "SIMPLE IRA": { totalRemaining: 0, totalOpportunity: 0, totalLimit: 0, totalContributed: 0, icon: PieChart, iconClassName: "text-[hsl(var(--chart-orange))]" },
    };

    accounts.forEach(acc => {
      const remaining = Math.max(0, acc.annualLimit - acc.amountContributed);
      result[acc.accountType].totalRemaining += remaining;
      result[acc.accountType].totalOpportunity += remaining * MOCK_FEE_RATE;
      result[acc.accountType].totalLimit += acc.annualLimit;
      result[acc.accountType].totalContributed += acc.amountContributed;
    });

    return IRA_TYPES_ORDER.map(type => {
      const data = result[type];
      const percentageFunded = data.totalLimit > 0 ? (data.totalContributed / data.totalLimit) * 100 : 0;
      return {
        name: type,
        ...data,
        percentageFunded: parseFloat(percentageFunded.toFixed(1)),
      };
    });
  }, [accounts]);

  if (accounts.length === 0) {
    return (
        <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
    );
  }


  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Contribution Matrix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {aggregatedDataByType.map((item) => (
          <PlaceholderCard 
            key={item.name} 
            title={item.name}
            value={`${item.percentageFunded.toFixed(1)}%`}
            description={
              <>
                <span className="block text-sm text-green-400 mt-1">
                  +${item.totalOpportunity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} fee potential
                </span>
                <span className="block text-xs text-muted-foreground mt-1">
                  (${item.totalRemaining.toLocaleString()} remaining)
                </span>
              </>
            }
            icon={item.icon}
            iconClassName={item.iconClassName}
            className="text-center"
          >
          </PlaceholderCard>
        ))}
      </div>

      <PlaceholderCard title="IRA Contribution Overview" className="overflow-x-auto">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Account Number</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold text-right">Annual Limit</TableHead>
              <TableHead className="font-bold text-right w-40">Contributed</TableHead>
              <TableHead className="font-bold text-right">Remaining</TableHead>
              <TableHead className="font-bold min-w-[96px] w-[96px] text-right">Progress (%)</TableHead>
              <TableHead className="font-bold text-right whitespace-nowrap">Monthly to Max-Out</TableHead>
              <TableHead className="font-bold text-center whitespace-nowrap">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const remaining = account.annualLimit - account.amountContributed;
              const progressPercent = account.annualLimit > 0 ? Math.min(100, Math.max(0,(account.amountContributed / account.annualLimit) * 100)) : 0;
              const monthlyToMax = remaining > 0 && monthsLeft > 0 ? (remaining / monthsLeft) : 0;
              const dueDateInfo = getDueDateInfo(account.dueDate);

              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{account.accountName}</span>
                        </TooltipTrigger>
                        {account.originalAccountName && (
                           <TooltipContent>
                            <p>{account.originalAccountName}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{account.accountType}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">${account.annualLimit.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-foreground">
                    <span>${account.amountContributed.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">${remaining.toLocaleString()}</TableCell>
                  <TableCell className="w-[96px] align-middle">
                     <div className="flex justify-end">
                       <ProgressDonut percent={progressPercent} size={40} strokeWidth={6} />
                     </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {monthlyToMax > 0 && progressPercent < 100 ? `$${monthlyToMax.toFixed(2)}/mo` : (progressPercent >= 100 ? "Maxed Out" : "N/A")}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn("due-box", dueDateInfo.boxClassName, dueDateInfo.pulseClassName)}>
                            {dueDateInfo.mainDisplay}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dueDateInfo.tooltipDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex justify-end items-center gap-4 mt-6">
          <Button variant="outline" className="rounded-md" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download Contribution Summary
          </Button>
        </div>
      </PlaceholderCard>

    </main>
  );
}
