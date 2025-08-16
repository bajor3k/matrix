
"use client";

import * as React from "react";
import { PlaceholderCard } from "@/components/dashboard/placeholder-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CalendarDays, Filter, MessageSquare, Send, Server, Landmark, Briefcase, Video, Mail, RefreshCcw } from "lucide-react";
import { format, subDays, addDays, subMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AlertItem {
  id: string;
  title: string;
  messagePreview: string;
  dateTime: string;
  category: 'System' | 'Compliance' | 'Portfolio' | 'Trade' | 'Security';
  severity: 'Info' | 'Warning' | 'Urgent';
  isRead: boolean;
}

type SystemStatus = "Operational" | "Performance Issues" | "Down";

interface SystemStatusItem {
  id: string;
  name: string;
  icon: React.ElementType;
  status: SystemStatus;
  lastChecked: string;
  details?: string;
}

const generateRandomDate = (daysAgoMin: number, daysAgoMax: number): string => {
  const days = Math.floor(Math.random() * (daysAgoMax - daysAgoMin + 1)) + daysAgoMin;
  return format(subDays(new Date(), days), "yyyy-MM-dd HH:mm:ss");
};

const initialMockAlerts: AlertItem[] = [
  { id: '1', title: 'Compliance Breach Detected', messagePreview: 'Account XYZ123 has exceeded trading limits for Q3. Immediate review required.', dateTime: "", category: 'Compliance', severity: 'Urgent', isRead: false },
  { id: '2', title: 'System Maintenance Scheduled', messagePreview: 'Scheduled maintenance tonight from 2 AM to 3 AM EST. Platform will be unavailable.', dateTime: "", category: 'System', severity: 'Info', isRead: true },
  { id: '3', title: 'Portfolio Rebalance Suggested', messagePreview: 'AI suggests rebalancing for client ABC portfolio due to recent market volatility and shift in risk tolerance.', dateTime: "", category: 'Portfolio', severity: 'Warning', isRead: false },
  { id: '4', title: 'Unusual Login Activity', messagePreview: 'Multiple failed login attempts detected on account JKL789 from an unrecognized IP address.', dateTime: "", category: 'Security', severity: 'Urgent', isRead: false },
  { id: '5', title: 'Trade Execution Confirmation', messagePreview: 'Buy order for 100 shares of MSFT at $450.20 executed successfully for account MNO456.', dateTime: "", category: 'Trade', severity: 'Info', isRead: true },
  { id: '6', title: 'Market Volatility Alert', messagePreview: 'High volatility detected in the energy sector. Review relevant client portfolios.', dateTime: "", category: 'Portfolio', severity: 'Warning', isRead: false },
  { id: '7', title: 'Policy Update: AML Requirements', messagePreview: 'New AML policy effective Nov 1st. Ensure all client documentation is up to date.', dateTime: "", category: 'Compliance', severity: 'Info', isRead: true },
  { id: '8', title: 'Upcoming RMD Deadline', messagePreview: 'Client GHI321 has an upcoming RMD deadline in 30 days. Initiate contact.', dateTime: "", category: 'Portfolio', severity: 'Warning', isRead: false },
];

const initialMockSystemStatuses: SystemStatusItem[] = [
  { id: 'netx360plus', name: 'NetX360+', icon: Server, status: 'Operational', lastChecked: '', details: 'All systems normal.' },
  { id: 'netx', name: 'NetXInvestor', icon: Server, status: 'Operational', lastChecked: '', details: 'All systems normal.' },
  { id: 'sanctuary', name: 'Sanctuary One', icon: Server, status: 'Performance Issues', lastChecked: '', details: 'API latency detected in reporting module.' },
  { id: 'schwab', name: 'Schwab Advisor Center', icon: Landmark, status: 'Operational', lastChecked: '' },
  { id: 'wealthscape', name: 'Wealthscape', icon: Briefcase, status: 'Down', lastChecked: '', details: 'Login unavailable. Investigating.' },
  { id: 'zoom', name: 'Zoom', icon: Video, status: 'Operational', lastChecked: '' },
  { id: 'outlook', name: 'Outlook / Exchange', icon: Mail, status: 'Operational', lastChecked: '' },
];


const getSeverityBadgeClass = (severity: AlertItem["severity"]): string => {
  switch (severity) {
    case "Urgent":
      return "bg-red-500/20 border-red-500/50 text-red-400";
    case "Warning":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    case "Info":
    default:
      return "bg-blue-500/20 border-blue-500/50 text-blue-400";
  }
};

const getCategoryBadgeClass = (category: AlertItem["category"]): string => {
    switch (category) {
      case "Compliance":
        return "bg-slate-500/20 border-slate-500/50 text-slate-400";
      case "System":
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
      case "Portfolio":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "Trade":
        return "bg-teal-500/20 border-teal-500/50 text-teal-400";
      case "Security":
        return "bg-orange-500/20 border-orange-500/50 text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

const getSystemStatusBadgeClass = (status: SystemStatus): string => {
  switch (status) {
    case "Operational":
      return "bg-green-500/20 border-green-500/50 text-green-400";
    case "Performance Issues":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    case "Down":
      return "bg-red-500/20 border-red-500/50 text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};


export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<AlertItem[]>(initialMockAlerts);
  const [systemStatuses, setSystemStatuses] = React.useState<SystemStatusItem[]>(initialMockSystemStatuses);
  const [broadcastMessageInput, setBroadcastMessageInput] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    const generateLastCheckedTime = (minutesAgoMax: number): string => {
      const minutes = Math.floor(Math.random() * minutesAgoMax) + 1;
      return format(subMinutes(new Date(), minutes), "MMM dd, HH:mm");
    };

    const mockSystemStatusesWithDates: SystemStatusItem[] = [
      { id: 'netx360plus', name: 'NetX360+', icon: Server, status: 'Operational', lastChecked: generateLastCheckedTime(7), details: 'All systems normal.' },
      { id: 'netx', name: 'NetXInvestor', icon: Server, status: 'Operational', lastChecked: generateLastCheckedTime(5), details: 'All systems normal.' },
      { id: 'sanctuary', name: 'Sanctuary One', icon: Server, status: 'Performance Issues', lastChecked: generateLastCheckedTime(2), details: 'API latency detected in reporting module.' },
      { id: 'schwab', name: 'Schwab Advisor Center', icon: Landmark, status: 'Operational', lastChecked: generateLastCheckedTime(10) },
      { id: 'wealthscape', name: 'Wealthscape', icon: Briefcase, status: 'Down', lastChecked: generateLastCheckedTime(1), details: 'Login unavailable. Investigating.' },
      { id: 'zoom', name: 'Zoom', icon: Video, status: 'Operational', lastChecked: generateLastCheckedTime(15) },
      { id: 'outlook', name: 'Outlook / Exchange', icon: Mail, status: 'Operational', lastChecked: generateLastCheckedTime(3) },
    ];
    
    const mockAlertsWithDates: AlertItem[] = [
      { id: '1', title: 'Compliance Breach Detected', messagePreview: 'Account XYZ123 has exceeded trading limits for Q3. Immediate review required.', dateTime: generateRandomDate(1, 2), category: 'Compliance', severity: 'Urgent', isRead: false },
      { id: '2', title: 'System Maintenance Scheduled', messagePreview: 'Scheduled maintenance tonight from 2 AM to 3 AM EST. Platform will be unavailable.', dateTime: generateRandomDate(0, 0), category: 'System', severity: 'Info', isRead: true },
      { id: '3', title: 'Portfolio Rebalance Suggested', messagePreview: 'AI suggests rebalancing for client ABC portfolio due to recent market volatility and shift in risk tolerance.', dateTime: generateRandomDate(3, 5), category: 'Portfolio', severity: 'Warning', isRead: false },
      { id: '4', title: 'Unusual Login Activity', messagePreview: 'Multiple failed login attempts detected on account JKL789 from an unrecognized IP address.', dateTime: generateRandomDate(0, 1), category: 'Security', severity: 'Urgent', isRead: false },
      { id: '5', title: 'Trade Execution Confirmation', messagePreview: 'Buy order for 100 shares of MSFT at $450.20 executed successfully for account MNO456.', dateTime: generateRandomDate(1, 1), category: 'Trade', severity: 'Info', isRead: true },
      { id: '6', title: 'Market Volatility Alert', messagePreview: 'High volatility detected in the energy sector. Review relevant client portfolios.', dateTime: generateRandomDate(0, 0), category: 'Portfolio', severity: 'Warning', isRead: false },
      { id: '7', title: 'Policy Update: AML Requirements', messagePreview: 'New AML policy effective Nov 1st. Ensure all client documentation is up to date.', dateTime: generateRandomDate(7, 10), category: 'Compliance', severity: 'Info', isRead: true },
      { id: '8', title: 'Upcoming RMD Deadline', messagePreview: 'Client GHI321 has an upcoming RMD deadline in 30 days. Initiate contact.', dateTime: generateRandomDate(0, 0), category: 'Portfolio', severity: 'Warning', isRead: false },
    ];

    setAlerts(mockAlertsWithDates);
    setSystemStatuses(mockSystemStatusesWithDates);
  }, []);

  const toggleReadStatus = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: !alert.isRead } : alert
      )
    );
  };

  const handleSendBroadcast = () => {
    if (broadcastMessageInput.trim()) {
      toast({
        title: "Broadcast Sent!",
        description: `Message "${broadcastMessageInput.trim()}" has been broadcast.`,
      });
      setBroadcastMessageInput("");
    }
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Alert Center</h1>

      <PlaceholderCard title="Broadcast New Alert">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            type="text"
            placeholder="Enter broadcast message..."
            value={broadcastMessageInput}
            onChange={(e) => setBroadcastMessageInput(e.target.value)}
            className="flex-grow bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"
          />
          <div className="flex gap-2">
            <Button onClick={handleSendBroadcast} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none">
              <Send className="mr-2 h-4 w-4" /> Send Broadcast
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">High-visibility alerts sent here will be displayed to all users.</p>
      </PlaceholderCard>

      <PlaceholderCard title="System Status Monitor">
        <div className="space-y-2">
          {systemStatuses.map((system) => {
            const IconComponent = system.icon;
            return (
              <div key={system.id} className="flex items-center justify-between p-3 border-b border-border/20 last:border-b-0 hover:bg-muted/10 transition-colors rounded-md -m-1">
                <div className="flex items-center gap-3">
                  <IconComponent className={cn("h-6 w-6",
                    system.status === "Operational" && "text-green-400",
                    system.status === "Performance Issues" && "text-yellow-400",
                    system.status === "Down" && "text-red-400"
                  )} />
                  <span className="font-medium text-foreground">{system.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getSystemStatusBadgeClass(system.status)}>
                    {system.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {system.lastChecked ? `Last checked: ${system.lastChecked}` : 'Checking...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
         <p className="text-xs text-muted-foreground mt-3 text-center">Status checks are automated. For issues, contact IT support.</p>
      </PlaceholderCard>

    </main>
  );
}
