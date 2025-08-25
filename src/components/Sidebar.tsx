// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, FileStack, Wallet, Percent, BadgeDollarSign, FlaskConical } from "lucide-react";

type Item = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const reportItems: Item[] = [
  { label: "Advisory Fees Cash", href: "/reports/3m-cash", icon: FileStack },
  { label: "Cash Balance",        href: "/reports/cash-alerts",       icon: Wallet },
  { label: "Margin",              href: "/reports/margin-notify",             icon: Percent },
  { label: "Advisory Fees",       href: "/reports/advisor-summary",      icon: BadgeDollarSign },
  { label: "Test",                href: "/reports/billing-coverage",               icon: FlaskConical },
];

function NavLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
                  ${active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isInReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const [open, setOpen] = useState<boolean>(isInReports);

  return (
    <aside className="w-64 bg-[#000104] text-zinc-200 p-3">
      {/* TOP NAV ITEMS (CRM, Analytics, etc.) remain above this as you already have */}

      {/* Reports parent */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium text-zinc-100 hover:bg-white/5"
        aria-expanded={open}
        aria-controls="reports-menu"
      >
        <span className="flex items-center gap-3">
          {/* Use your brain icon here if you prefer */}
          <FileStack className="h-4 w-4" />
          Reports
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Reports submenu */}
      <div
        id="reports-menu"
        className={`overflow-hidden transition-[max-height] duration-200 ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="mt-1 space-y-1 pl-2">
          {reportItems.map(item => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </div>

      {/* …rest of your sidebar items below */}
    </aside>
  );
}
