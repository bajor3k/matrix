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
import { navigationData } from "@/lib/navigation-data";

type Item = { name: string; href: string; icon?: any };

const reportItems: Item[] = navigationData['Reports'];
const crmItems: Item[] = navigationData['CRM'];
const analyticsItems: Item[] = navigationData['Analytics'];
const resourceItems: Item[] = navigationData['Resources'];


function Row({ item, active, hiddenLabel }: { item: Item; active: boolean; hiddenLabel: boolean }) {
  const Icon = item.icon ?? FileStack;
  return (
    <Link
      href={item.href}
      title={item.name}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition w-full
        ${active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!hiddenLabel && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

export default function Sidebar({
  collapsed
}: {
  collapsed: boolean;
}) {
  const pathname = usePathname();

  // Auto-open the section relevant to the current route
  const isReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const isCRM = useMemo(() => pathname?.startsWith("/client-portal"), [pathname]);
  const isAnalytics = useMemo(() => [
    "/asset-analytics", "/client-analytics", "/financial-analytics", 
    "/conversion-analytics", "/compliance-matrix", "/portfolio-matrix", 
    "/model-matrix", "/contribution-matrix"
  ].some(p => pathname.startsWith(p)), [pathname]);
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
      <div className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open && !collapsed ? "max-h-[500px]" : "max-h-0"}`}>
        <div className="mt-1 space-y-1 pl-2 pr-1">
          {items.map((it) => (
            <Row key={it.href} item={it} active={pathname === it.href} hiddenLabel={!!collapsed} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col p-3 pt-2">
        <Section title="Reports"   icon={FileStack}  open={openReports}   setOpen={setOpenReports}   items={reportItems} />
        <Section title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} />
        <Section title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} />
        <Section title="Resources" icon={BookOpen} open={openResources} setOpen={setOpenResources} items={resourceItems} />
    </div>
  );
}