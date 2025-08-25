
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, ChevronRight, FileStack, Wallet, Percent, BadgeDollarSign, FlaskConical,
} from "lucide-react";

export default function Sidebar({
  collapsed,
}: {
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isInReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const [open, setOpen] = useState(isInReports);

  useEffect(() => {
    if (isInReports) {
      setOpen(true);
    }
  }, [isInReports]);

  const Item = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: any;
  }) => {
    const active = pathname === href;
    return (
        <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition truncate
            ${active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
        >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
  }

  return (
    <aside className="w-64 border-r border-white/10 bg-[#000104] p-3">
      <nav className="flex flex-col">
        {/* Reports parent */}
        <button
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium hover:bg-white/5"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="reports-submenu"
        >
          <span className="flex items-center gap-3">
            <FileStack className="h-4 w-4" />
            Reports
          </span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Submenu */}
        <div
          id="reports-submenu"
          className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open ? "max-h-96" : "max-h-0"}`}
        >
          <div className="mt-1 space-y-1 py-1 pl-2 pr-1">
            <Item href="/reports/3m-cash" label="Advisory Fees Cash" icon={FileStack} />
            <Item href="/reports/cash-alerts" label="Cash Balance" icon={Wallet} />
            <Item href="/reports/margin-notify" label="Margin" icon={Percent} />
            <Item href="/reports/advisor-summary" label="Advisory Fees" icon={BadgeDollarSign} />
            <Item href="/reports/billing-coverage" label="Test" icon={FlaskConical} />
          </div>
        </div>
      </nav>
    </aside>
  );
}
