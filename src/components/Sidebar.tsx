// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  FileStack, Users, BarChart3, BookOpen,
  Wallet, Percent, BadgeDollarSign, FlaskConical, Home, Mail, Contact, ListChecks, Workflow, CalendarDays, Briefcase, KanbanSquare, FileText, TrendingUp, Repeat, ShieldAlert, PieChart, Shapes, Link as LinkIcon, LifeBuoy, Calculator, GraduationCap
} from "lucide-react";

type Item = { label: string; href: string; icon?: any };

const reportItems: Item[] = [
  { label: "Advisory Fees Cash", href: "/reports/3m-cash", icon: FileStack },
  { label: "Cash Balance",        href: "/reports/cash-alerts",       icon: Wallet },
  { label: "Margin",              href: "/reports/margin-notify",             icon: Percent },
  { label: "Advisory Fees",       href: "/reports/advisor-summary",      icon: BadgeDollarSign },
  { label: "Test",                href: "/reports/billing-coverage",               icon: FlaskConical },
];

const crmItems: Item[] = [
    { label: "Home", href: "/client-portal/home", icon: Home },
    { label: "Email", href: "/client-portal/email", icon: Mail },
    { label: "Contacts", href: "/client-portal/contacts", icon: Contact },
    { label: "Tasks", href: "/client-portal/tasks", icon: ListChecks },
    { label: "Workflows", href: "/client-portal/workflows", icon: Workflow },
    { label: "Calendar", href: "/client-portal/calendar", icon: CalendarDays },
    { label: "Opportunities", href: "/client-portal/opportunities", icon: Briefcase },
    { label: "Projects", href: "/client-portal/projects", icon: KanbanSquare },
    { label: "Files", href: "/client-portal/files", icon: FileText },
];

const analyticsItems: Item[] = [
    { label: "Asset Analytics", href: "/asset-analytics", icon: BarChart3 },
    { label: "Client Analytics", href: "/client-analytics", icon: Users },
    { label: "Financial Analytics", href: "/financial-analytics", icon: TrendingUp },
    { label: "Conversion Analytics", href: "/conversion-analytics", icon: Repeat },
    { label: "Compliance Matrix", href: "/compliance-matrix", icon: ShieldAlert },
    { label: "Portfolio Matrix", href: "/portfolio-matrix", icon: PieChart },
    { label: "Model Matrix", href: "/model-matrix", icon: Shapes },
    { label: "Contribution Matrix", href: "/contribution-matrix", icon: TrendingUp },
];

const resourceItems: Item[] = [
    { label: "Quick Links", href: "/resource-matrix?tab=quick_links", icon: LinkIcon },
    { label: "Documents", href: "/resource-matrix?tab=documents", icon: FileText },
    { label: "Support", href: "/resource-matrix?tab=support", icon: LifeBuoy },
    { label: "Tools", href: "/resource-matrix?tab=tools", icon: Calculator },
    { label: "Training", href: "/resource-matrix?tab=training", icon: GraduationCap },
];

function Row({ item, active, hiddenLabel }: { item: Item; active: boolean; hiddenLabel: boolean }) {
  const Icon = item.icon ?? FileStack;
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition w-full
        ${active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!hiddenLabel && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();

  // Auto-open the section relevant to the current route
  const isReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const isCRM = useMemo(() => pathname?.startsWith("/client-portal"), [pathname]);
  const isAnalytics = useMemo(() => [
    "/asset-analytics", "/client-analytics", "/financial-analytics", 
    "/conversion-analytics", "/compliance-matrix", "/portfolio-matrix", 
    "/model-matrix", "/contribution-matrix"
  ].includes(pathname), [pathname]);
  const isResources = useMemo(() => pathname?.startsWith("/resource-matrix"), [pathname]);

  const [openReports, setOpenReports] = useState(isReports);
  const [openCRM, setOpenCRM] = useState(isCRM);
  const [openAnalytics, setOpenAnalytics] = useState(isAnalytics);
  const [openResources, setOpenResources] = useState(isResources);

  useEffect(() => setOpenReports(isReports), [isReports]);
  useEffect(() => setOpenCRM(isCRM), [isCRM]);
  useEffect(() => setOpenAnalytics(isAnalytics), [isAnalytics]);
  useEffect(() => setOpenResources(isResources), [isResources]);

  const Section = ({
    title,
    icon: Icon,
    open,
    setOpen,
    items,
  }: {
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: Item[];
  }) => (
    <div className="mb-2">
      {/* parent row */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium
          ${collapsed ? "justify-center" : ""} hover:bg-white/5`}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && title}
        </span>
        {!collapsed && (open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />)}
      </button>

      {/* submenu */}
      <div className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open && !collapsed ? "max-h-96" : "max-h-0"}`}>
        <div className="mt-1 space-y-1 pl-2 pr-1">
          {items.map((it) => (
            <Row key={it.href} item={it} active={pathname === it.href} hiddenLabel={!!collapsed} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      {/* top collapse control */}
      <div className="flex items-center justify-end px-2 pt-2 pb-1 border-b border-border/10">
        <button
          onClick={onToggleCollapsed}
          className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-3 pt-2">
        <Section title="Reports"   icon={FileStack}  open={openReports}   setOpen={setOpenReports}   items={reportItems} />
        <Section title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} />
        <Section title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} />
        <Section title="Resources" icon={BookOpen} open={openResources} setOpen={setOpenResources} items={resourceItems} />
      </div>
    </div>
  );
}
