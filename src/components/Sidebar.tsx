// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileStack, Wallet, Percent, BadgeDollarSign, FlaskConical } from "lucide-react";
import { useNavigation } from "@/contexts/navigation-context";
import { navigationData } from "@/lib/navigation-data";

export default function Sidebar() {
  const pathname = usePathname();
  const { activeSection } = useNavigation();
  const navItems = navigationData[activeSection] || [];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    // This logic can be more sophisticated, e.g., checking if any child is active
    initialState['Reports'] = pathname.startsWith('/reports');
    return initialState;
  });

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const Item = ({ href, label, Icon }: { href: string; label: string; Icon: any }) => (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition
        ${pathname === href ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );

  return (
    <nav className="h-full w-full p-4">
      {navItems.map((item) => (
         <Item key={item.href} href={item.href} label={item.name} Icon={item.icon} />
      ))}
    </nav>
  );
}
