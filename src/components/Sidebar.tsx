// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, FileStack, Users, BarChart3, BookOpenText,
  Wallet, Percent, BadgeDollarSign, FlaskConical,
  Settings as SettingsIcon,
  ChevronRight,
  Video,
  Terminal,
  TerminalSquare,
  KanbanSquare,
  Newspaper,
  Mail,
  AlertOctagon,
  CalendarDays,
  LayoutGrid,
  Bell,
  Robot,
  FileText,
  Globe,
  Bot,
  Megaphone,
} from "lucide-react";
import { navigationData } from "@/lib/navigation-data";
import { useNavigation, type NavItem } from "@/contexts/navigation-context";
import { cn } from "@/lib/utils";

export type SectionKey = "reports" | "crm" | "analytics" | "resources" | "mail";

const reportItems: NavItem[] = navigationData['Reports'];
const crmItems: NavItem[] = navigationData['CRM'];
const mailItems: NavItem[] = navigationData['Mail'];
const analyticsItems: NavItem[] = navigationData['Analytics'];
const resourceItems: NavItem[] = navigationData['Resources'];

// Standalone items
const dashboardItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Dashboard')!;
const insightsItem: NavItem = navigationData['Standalone'].find(item => item.name === 'AI Insights')!;
const alertsItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Alerts')!;
const ticketItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Ticket')!;
const bullpenItem: NavItem = navigationData['Standalone'].find(item => item.name === 'The Bullpen')!;
const settingsItem: NavItem = navigationData['Other'][0];


function Row({ item, active, hiddenLabel, iconClassName }: { item: NavItem; active: boolean; hiddenLabel: boolean, iconClassName?: string }) {
  const Icon = item.icon ?? FileStack;
  return (
    <Link
      href={item.href}
      title={item.name}
      data-active={active}
      className={`nav-item flex items-center gap-3 rounded-xl py-2 text-sm transition w-full
        ${hiddenLabel ? 'justify-center px-0' : 'px-3'}
        ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
    >
      <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
      {!hiddenLabel && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

export default function Sidebar({
  collapsed,
  onExpandRequest,
  forceOpen,
  onForceOpenHandled,
}: {
  collapsed: boolean;
  onExpandRequest: (section: SectionKey) => void;
  forceOpen?: SectionKey | null;
  onForceOpenHandled?: () => void;
}) {
  const pathname = usePathname();

  const isReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const isCRM = useMemo(() => pathname?.startsWith("/CRM"), [pathname]);
  const isMail = useMemo(() => pathname?.startsWith("/mail") || pathname === "/calendar", [pathname]);

  const isAnalytics = useMemo(() => [
    "/analytics/asset", "/analytics/client", "/analytics/financial", 
    "/analytics/conversion", "/analytics/compliance", "/analytics/contribution"
  ].some(p => pathname.startsWith(p)), [pathname]);
  
  const isResources = useMemo(() => pathname?.startsWith("/resources"), [pathname]);
  
  const isDashboard = useMemo(() => pathname === "/dashboard", [pathname]);
  const isInsights = useMemo(() => pathname === "/ai-insights", [pathname]);
  const isAlerts = useMemo(() => pathname === "/alerts", [pathname]);
  const isTicket = useMemo(() => pathname === "/ticket", [pathname]);
  const isBullpen = useMemo(() => pathname === "/bullpen", [pathname]);
  const isSettings  = useMemo(() => pathname === "/settings", [pathname]);
  

  const [openReports, setOpenReports] = useState(isReports);
  const [openCRM, setOpenCRM] = useState(isCRM);
  const [openMail, setOpenMail] = useState(isMail);
  const [openAnalytics, setOpenAnalytics] = useState(isAnalytics);
  const [openResources, setOpenResources] = useState(isResources);

  useEffect(() => setOpenReports(isReports), [isReports]);
  useEffect(() => setOpenCRM(isCRM), [isCRM]);
  useEffect(() => setOpenMail(isMail), [isMail]);
  useEffect(() => setOpenAnalytics(isAnalytics), [isAnalytics]);
  useEffect(() => setOpenResources(isResources), [isResources]);

  // When parent asks to open a specific section (after expanding)
  useEffect(() => {
    if (!forceOpen) return;
    setOpenReports(forceOpen === "reports");
    setOpenCRM(forceOpen === "crm");
    setOpenMail(forceOpen === "mail");

    setOpenAnalytics(forceOpen === "analytics");
    setOpenResources(forceOpen === "resources");
    onForceOpenHandled?.();
  }, [forceOpen, onForceOpenHandled]);


  const Section = ({
    keyName,
    title,
    icon: Icon,
    open,
    setOpen,
    items,
    href,
    iconClassName
  }: {
    keyName: SectionKey;
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: NavItem[]; href?: string; iconClassName?: string;
  }) => {
    if (!items) return null; // Guard against null/undefined items

    const onHeaderClick = () => {
      if (collapsed) {
        onExpandRequest(keyName as SectionKey);
      } else {
        setOpen(!open);
      }
    };
    
    // Determine if the header should act as a link or a button
    const HeaderComponent = href && !items.length ? Link : 'button';
    const headerProps: any = href && !items.length ? { href } : { onClick: onHeaderClick };
    
    return (
    <div className="mb-1">
       <HeaderComponent
        {...headerProps}
        aria-expanded={items.length > 0 ? open : undefined}
        className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground
         hover:bg-accent hover:text-accent-foreground ${collapsed ? 'px-0 justify-center' : 'px-3 justify-between'}`}
       >
        <span className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
          {!collapsed && title}
        </span>

        {!collapsed && items.length > 0 && (open ? <ChevronUp className="h-4 w-4 shrink-0"/> : <ChevronDown className="h-4 w-4 shrink-0"/>)}
      </HeaderComponent>
      {items.length > 0 && (
        <div className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open && !collapsed ? "max-h-[500px]" : "max-h-0"}`}>
          <div className="mt-1 space-y-1 pl-2 pr-1">
            {items.map((it) => (
              <Row key={it.href} item={it} active={pathname === it.href} hiddenLabel={!!collapsed} />
            ))}
          </div>
        </div>
      )}
    </div>
  )};

  const StandaloneItem = ({ item, isActive, iconClassName }: { item: NavItem, isActive: boolean, iconClassName?: string }) => {
    if (!item || !item.icon) return null; // Safety check
    return (
      <div className="mb-1">
        <Link
          href={item.href}
          title={item.name}
          data-active={isActive}
          className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isActive ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        >
          <span className="flex items-center gap-3">
            <item.icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
            {!collapsed && item.name}
          </span>
        </Link>
    </div>
    )
  };


  return (
    <div className="flex h-full w-full flex-col p-3 pt-2">
      {/* sections */}
      <div className="h-[calc(100%-60px)] overflow-y-auto">
        
        <StandaloneItem item={dashboardItem} isActive={isDashboard} iconClassName="text-emerald-500" />
        
        <Section keyName="mail" title="Mail" icon={Mail} open={openMail} setOpen={setOpenMail} items={mailItems} iconClassName="text-[hsl(var(--icon-color-1))]" />
        
        <Section keyName="analytics" title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} iconClassName="text-[hsl(var(--icon-color-2))]"/>
        
        <Section 
          keyName="resources" 
          title="Resources" 
          icon={BookOpenText} 
          open={openResources} 
          setOpen={setOpenResources} 
          items={resourceItems} 
          iconClassName="text-yellow-500"
        />
        
        <div className="mb-1">
          <Link
            href={insightsItem.href}
            title={insightsItem.name}
            data-active={isInsights}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isInsights ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <Bot className="h-5 w-5 shrink-0 text-green-400" />
              {!collapsed && insightsItem.name}
            </span>
          </Link>
        </div>

        <Section keyName="crm" title="CRM" icon={Users} open={openCRM} setOpen={setOpenCRM} items={crmItems} href="/CRM" iconClassName="text-teal-400" />

        <StandaloneItem item={alertsItem} isActive={isAlerts} iconClassName="text-[hsl(var(--chart-5))]" />
        <StandaloneItem item={ticketItem} isActive={isTicket} iconClassName="text-[hsl(var(--icon-color-1))]" />
        <StandaloneItem item={bullpenItem} isActive={isBullpen} iconClassName="text-yellow-500" />

      </div>

      {/* footer — pinned at bottom */}
      <div className="mt-auto border-t border-border pt-3">
        <Link
          href="/settings"
          title="Settings"
          data-active={isSettings}
          className={`nav-item group flex items-center gap-3 rounded-xl py-2 text-sm transition
            ${collapsed ? 'justify-center px-0' : 'px-3'}
            ${isSettings ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
        >
          <SettingsIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
      </div>
    </div>
  );
}
