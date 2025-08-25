
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, ChevronRight, FileStack, Wallet, Percent, BadgeDollarSign, FlaskConical,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  className = "",
  onNavigate,
}: {
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isInReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const [open, setOpen] = useState(isInReports);

  useEffect(() => setOpen(isInReports), [isInReports]);

  const width = collapsed ? "w-[72px]" : "w-[256px]";

  const Item = ({
    href,
    label,
    icon: Icon,
    active,
  }: {
    href: string;
    label: string;
    icon: any;
    active?: boolean;
  }) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition truncate
        ${active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`${className} ${width} border-r border-white/10 bg-[#000104] transition-[width] duration-200`}
    >
      <nav className="p-3">
        {/* Reports parent */}
        <button
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium 
            ${collapsed ? "pointer-events-none opacity-70" : "hover:bg-white/5"}`}
          onClick={() => !collapsed && setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="reports-submenu"
        >
          <span className="flex items-center gap-3">
            <FileStack className="h-4 w-4" />
            {!collapsed && "Reports"}
          </span>
          {!collapsed && (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>

        {/* Submenu */}
        <div
          id="reports-submenu"
          className={`overflow-hidden transition-[max-height] ${open && !collapsed ? "max-h-96" : "max-h-0"}`}
        >
          <div className="mt-1 space-y-1 pl-2 pr-1">
            <Item href="/reports/3m-cash" label="Advisory Fees Cash" icon={FileStack} active={pathname === "/reports/3m-cash"} />
            <Item href="/reports/cash-alerts"       label="Cash Balance"        icon={Wallet} active={pathname === "/reports/cash-alerts"} />
            <Item href="/reports/margin-notify"             label="Margin"              icon={Percent} active={pathname === "/reports/margin-notify"} />
            <Item href="/reports/advisor-summary"      label="Advisory Fees"       icon={BadgeDollarSign} active={pathname === "/reports/advisor-summary"} />
            <Item href="/reports/billing-coverage"               label="Test"                icon={FlaskConical} active={pathname === "/reports/billing-coverage"} />
          </div>
        </div>
      </nav>
    </aside>
  );
}
