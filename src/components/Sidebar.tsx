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
} from "lucide-react";
import { navigationData } from "@/lib/navigation-data";
import { useNavigation, type NavItem } from "@/contexts/navigation-context";

export type SectionKey = "reports" | "crm" | "analytics" | "resources";

const reportItems: NavItem[] = navigationData['Reports'];
const crmItems: NavItem[] = navigationData['CRM'];
const analyticsItems: NavItem[] = navigationData['Analytics'];
const resourceItems: NavItem[] = navigationData['Resources'];
const videoReportItem: NavItem = navigationData['Standalone'][0];
const terminalItem: NavItem = navigationData['Standalone'][1];
const terminal2Item: NavItem = navigationData['Standalone'][2];
const settingsItem: NavItem = navigationData['Other'][0];


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
  const isVideoReports = useMemo(() => pathname?.startsWith("/video-reports"), [pathname]);
  const isResources = useMemo(() => pathname?.startsWith("/resources"), [pathname]);
  const isTerminal = useMemo(() => pathname === "/terminal", [pathname]);
  const isTerminal2 = useMemo(() => pathname === "/terminal-2-0", [pathname]);
  const isSettings  = useMemo(() => pathname === "/settings", [pathname]);

  const [openReports, setOpenReports] = useState(isReports);
  const [openCRM, setOpenCRM] = useState(isCRM);
  const [openAnalytics, setOpenAnalytics] = useState(isAnalytics);
  const [openVideoReports, setOpenVideoReports] = useState(isVideoReports);
  const [openResources, setOpenResources] = useState(isResources);

  useEffect(() => setOpenReports(isReports), [isReports]);
  useEffect(() => setOpenCRM(isCRM), [isCRM]);
  useEffect(() => setOpenAnalytics(isAnalytics), [isAnalytics]);
  useEffect(() => setOpenVideoReports(isVideoReports), [isVideoReports]);
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
    href
  }: {
    keyName: SectionKey | 'video-reports';
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: NavItem[]; href?: string;
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
    <div className="mb-2">
       <div
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium
         hover:bg-accent`}
         aria-expanded={open}
       >
        <HeaderWrapper>
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && title}
          </span>
        </HeaderWrapper>
        {!collapsed && (open ? <ChevronUp className="h-4 w-4 shrink-0 cursor-pointer" onClick={onHeaderClick}/> : <ChevronDown className="h-4 w-4 shrink-0 cursor-pointer" onClick={onHeaderClick}/>)}
      </div>
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
        
        <Section keyName="crm" title="CRM"       icon={Users}      open={openCRM}       setOpen={setOpenCRM}       items={crmItems} />
        <Section keyName="analytics" title="Analytics" icon={BarChart3}  open={openAnalytics} setOpen={setOpenAnalytics} items={analyticsItems} />
        
        <Section keyName="video-reports" title={videoReportItem.name} icon={videoReportItem.icon} open={openVideoReports} setOpen={setOpenVideoReports} items={videoReportItem.children ?? []} href={videoReportItem.href}/>

        {/* <Section keyName="resources" title="Resources" icon={BookOpenText} open={openResources} setOpen={setOpenResources} items={resourceItems} /> */}
        
        {/* <div className="mb-2">
          <Link
            href={terminalItem.href}
            title={terminalItem.name}
            data-active={isTerminal}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium hover:bg-accent ${isTerminal ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <span className="flex items-center gap-3">
              <Terminal className="h-5 w-5 shrink-0" />
              {!collapsed && terminalItem.name}
            </span>
          </Link>
        </div> */}

        <div className="mb-2">
          <Link
            href={terminal2Item.href}
            title={terminal2Item.name}
            data-active={isTerminal2}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium hover:bg-accent ${isTerminal2 ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <span className="flex items-center gap-3">
              <TerminalSquare className="h-5 w-5 shrink-0" />
              {!collapsed && terminal2Item.name}
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
