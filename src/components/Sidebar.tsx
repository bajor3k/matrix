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
  Brain,
  LayoutGrid,
  Bell,
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
const crm2Item: NavItem = navigationData['Standalone'].find(item => item.name === 'CRM')!;
const insightsItem: NavItem = navigationData['Standalone'].find(item => item.name === 'AI Insights')!;
const dashboardItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Dashboard')!;

const alertsItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Alerts')!;
const ticketItem: NavItem = navigationData['Standalone'].find(item => item.name === 'Ticket')!;
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
  const isCRM = useMemo(() => pathname?.startsWith("/crm"), [pathname]);
  const isMail = useMemo(() => pathname?.startsWith("/mail"), [pathname]);

  const isAnalytics = useMemo(() => [
    "/analytics/asset", "/analytics/client", "/analytics/financial", 
    "/analytics/conversion", "/analytics/compliance", "/analytics/contribution"
  ].some(p => pathname.startsWith(p)), [pathname]);
  const isResources = useMemo(() => pathname?.startsWith("/resources"), [pathname]);
  const isCrm2 = useMemo(() => pathname === "/CRM", [pathname]);
  const isInsights = useMemo(() => pathname === "/ai-insights", [pathname]);
  const isDashboard = useMemo(() => pathname === "/dashboard", [pathname]);
  const isAlerts = useMemo(() => pathname === "/alerts", [pathname]);
  const isTicket = useMemo(() => pathname === "/ticket", [pathname]);
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
    if (!items || items.length === 0) return null;
    function onHeaderClick() {
      if (collapsed) {
        // Request the parent to expand and open THIS section
        onExpandRequest(keyName as SectionKey);
      } else {
        setOpen(!open);
      }
    }

    const hasChildren = items.some(item => !!item.children);

    const HeaderWrapper = ({children}: {children: React.ReactNode}) => href ? <Link href={href}>{children}</Link> : <>{children}</>;

    return (
    <div className="mb-1">
       <button
        onClick={onHeaderClick}
        aria-expanded={open}
        className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground
         hover:bg-accent hover:text-accent-foreground ${collapsed ? 'px-0 justify-center' : 'px-3 justify-between'}`}
       >
        <span className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
          {!collapsed && title}
        </span>

        {!collapsed && (open ? <ChevronUp className="h-4 w-4 shrink-0"/> : <ChevronDown className="h-4 w-4 shrink-0"/>)}
      </button>
      <div className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open && !collapsed ? "max-h-[500px]" : "max-h-0"}`}>
        <div className="mt-1 space-y-1 pl-2 pr-1">
          {items.map((it) => (
            <Row key={it.href} item={it} active={pathname === it.href} hiddenLabel={!!collapsed} />
          ))}
        </div>
      </div>
    </div>
  )};

  return (
    <div className="flex h-full w-full flex-col p-3 pt-2">
      {/* sections */}
      <div className="h-[calc(100%-60px)] overflow-y-auto">
        
        <div className="mb-1">
          <Link
            href={dashboardItem.href}
            title={dashboardItem.name}
            data-active={pathname === dashboardItem.href}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${pathname === dashboardItem.href ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 shrink-0 text-[hsl(var(--icon-color-6))]" />
              {!collapsed && dashboardItem.name}
            </span>
          </Link>
        </div>

        {/* <Section keyName="crm" title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} /> */}
        <Section keyName="mail" title="Mail" icon={Mail} open={openMail} setOpen={setOpenMail} items={mailItems} iconClassName="text-[hsl(var(--icon-color-1))]" />
        

        <Section keyName="analytics" title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} iconClassName="text-[hsl(var(--icon-color-2))]"/>
        
        <Section keyName="resources" title="Resources" icon={BookOpenText} open={openResources} setOpen={setOpenResources} items={resourceItems} iconClassName="text-[hsl(var(--icon-color-3))]"/>
        
        <div className="mb-1">
          <Link
            href={insightsItem.href}
            title={insightsItem.name}
            data-active={isInsights}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isInsights ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <GradientBrain className="h-5 w-5 shrink-0" />
              {!collapsed && insightsItem.name}
            </span>
          </Link>
        </div>

        <div className="mb-1">
          <Link
            href={crm2Item.href}
            title={crm2Item.name}
            data-active={isCrm2}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isCrm2 ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5 shrink-0 text-[hsl(var(--icon-color-5))]" />
              {!collapsed && crm2Item.name}
            </span>
          </Link>
        </div>

        <div className="mb-1">
          <Link
            href={alertsItem.href}
            title={alertsItem.name}
            data-active={isAlerts}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isAlerts ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <Bell className="h-5 w-5 shrink-0 text-[hsl(var(--chart-5))]" />
              {!collapsed && alertsItem.name}
            </span>
          </Link>
        </div>

        <div className="mb-1">
          <Link
            href={ticketItem.href}
            title={ticketItem.name}
            data-active={isTicket}
            className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isTicket ? 'bg-accent text-accent-foreground' : ''} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className="flex items-center gap-3">
              <KanbanSquare className="h-5 w-5 shrink-0 text-[hsl(var(--icon-color-1))]" />
              {!collapsed && ticketItem.name}
            </span>
          </Link>
        </div>

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

// Custom Gradient Icon Component
function GradientBrain({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#brain-gradient)" // References the gradient ID defined below
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))" }} // Adds a subtle neon glow
    >
      <defs>
        <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" /> {/* Fuchsia/Pink */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
        </linearGradient>
      </defs>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}
