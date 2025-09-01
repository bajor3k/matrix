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

export type SectionKey = "reports" | "crm" | "analytics" | "resources";

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
      data-active={active}
      className={`nav-item flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition w-full
        ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
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
  const isAnalytics = useMemo(() => [
    "/analytics/asset", "/analytics/client", "/analytics/financial", 
    "/analytics/conversion", "/analytics/compliance", "/analytics/contribution"
  ].some(p => pathname.startsWith(p)) || pathname.startsWith("/dashboard"), [pathname]);
  const isResources = useMemo(() => pathname?.startsWith("/resources"), [pathname]);
  const isSettings  = useMemo(() => pathname === "/settings", [pathname]);

  const [openReports, setOpenReports] = useState(isReports);
  const [openCRM, setOpenCRM] = useState(isCRM);
  const [openAnalytics, setOpenAnalytics] = useState(isAnalytics);
  const [openResources, setOpenResources] = useState(isResources);

  useEffect(() => setOpenReports(isReports), [isReports]);
  useEffect(() => setOpenCRM(isCRM), [isCRM]);
  useEffect(() => setOpenAnalytics(isAnalytics), [isAnalytics]);
  useEffect(() => setOpenResources(isResources), [isResources]);

  // When parent asks to open a specific section (after expanding)
  useEffect(() => {
    if (!forceOpen) return;
    setOpenReports(forceOpen === "reports");
    setOpenCRM(forceOpen === "crm");
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
  }: {
    keyName: SectionKey;
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: NavItem[];
  }) => {
    if (!items || items.length === 0) return null;
    function onHeaderClick() {
      if (collapsed) {
        // Request the parent to expand and open THIS section
        onExpandRequest(keyName);
      } else {
        setOpen(!open);
      }
    }
    return (
    <div className="mb-2">
      <button
        onClick={onHeaderClick}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium
         hover:bg-accent`}
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
  )};

  return (
    <div className="flex h-full w-full flex-col p-3 pt-2">
      {/* sections */}
      <div className="h-[calc(100%-60px)] overflow-y-auto">
        <Section keyName="reports" title="Reports"   icon={FileStack}  open={openReports}   setOpen={setOpenReports}   items={reportItems} />
        <Section keyName="crm" title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} />
        <Section keyName="analytics" title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} />
        <Section keyName="resources" title="Resources" icon={BookOpenText} open={openResources} setOpen={setOpenResources} items={resourceItems} />
      </div>

      {/* footer — SETTINGS pinned at bottom */}
      <div className="mt-auto border-t border-border pt-3">
        <Link
          href="/settings"
          title="Settings"
          data-active={isSettings}
          className={`nav-item group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
            ${isSettings ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
        >
          <SettingsIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
      </div>
    </div>
  );
}
