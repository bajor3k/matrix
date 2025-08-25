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
} from "lucide-react";
import { navigationData } from "@/lib/navigation-data";
import { useNavigation, type NavItem } from "@/contexts/navigation-context";

const reportItems: NavItem[] = navigationData['Reports'];
const crmItems: NavItem[] = navigationData['CRM'];
const analyticsItems: NavItem[] = navigationData['Analytics'];
const resourceItems: NavItem[] = navigationData['Resources'];


function Row({ item, active, hiddenLabel }: { item: NavItem; active: boolean; hiddenLabel: boolean }) {
  const Icon = item.icon ?? FileStack;
  return (
    <Link
      href={item.href}
      title={item.name}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition w-full
        ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!hiddenLabel && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const isReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const isCRM = useMemo(() => pathname?.startsWith("/client-portal"), [pathname]);
  const isAnalytics = useMemo(() => [
    "/asset-analytics", "/client-analytics", "/financial-analytics", 
    "/conversion-analytics", "/compliance-matrix", "/portfolio-matrix", 
    "/model-matrix", "/contribution-matrix", "/dashboard"
  ].some(p => pathname.startsWith(p)), [pathname]);
  const isResources = useMemo(() => pathname?.startsWith("/resource-matrix"), [pathname]);
  const isSettings  = useMemo(() => pathname === "/settings", [pathname]);

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
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: NavItem[];
  }) => (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium
          ${collapsed ? "justify-center" : ""} hover:bg-accent`}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && title}
        </span>
        {!collapsed && (open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />)}
      </button>
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
    <div className="flex h-full w-full flex-col p-3 pt-2">
      {/* sections */}
      <div className="h-[calc(100%-60px)] overflow-y-auto">
        <Section title="Reports"   icon={FileStack}  open={openReports}   setOpen={setOpenReports}   items={reportItems} />
        <Section title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} />
        <Section title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} />
        <Section title="Resources" icon={BookOpenText} open={openResources} setOpen={setOpenResources} items={resourceItems} />
      </div>

      {/* footer — SETTINGS pinned at bottom */}
      <div className="mt-auto border-t border-border pt-3">
        <Link
          href="/settings"
          title="Settings"
          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
            ${isSettings ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
        >
          <SettingsIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
      </div>
    </div>
  );
}