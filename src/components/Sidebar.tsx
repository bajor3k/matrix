
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useCallback } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  BellRing,
  Construction,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { NavItem } from "@/contexts/navigation-context";
import { useNavigation } from "@/contexts/navigation-context";
import { navigationData } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar.tsx";

const alertsNavItem: NavItem = {
  name: 'Alerts',
  icon: BellRing,
  href: '/alerts',
  hasNewAlerts: true,
};

export default function Sidebar() {
  const currentPathname = usePathname();
  const { activeSection } = useNavigation();
  const { collapsed, toggleSidebar } = useSidebar();

  const currentNavItems = navigationData[activeSection] || [];

  const renderNavItem = useCallback((item: NavItem, index: number) => {
    const isActive = currentPathname === item.href || (currentPathname.startsWith(item.href + '/') && item.href !== '/');
    
    const iconClasses = cn(
      "w-5 h-5 shrink-0 transition-colors duration-200",
      isActive 
        ? "text-sidebar-primary-foreground" 
        : item.hasNewAlerts
          ? "animate-red-pulse text-red-500" 
          : "text-sidebar-foreground/70 group-hover/navitem:text-sidebar-foreground"
    );

    const linkClasses = cn(
      "flex items-center gap-4 px-4 py-2.5 rounded-[8px] transition-all duration-200 ease-out group/navitem",
      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-primary/80 hover:-translate-y-px",
      collapsed && "justify-center p-2.5"
    );

    const linkContent = (
      <>
        <item.icon className={iconClasses} />
        {!collapsed && <span className="truncate text-base font-medium">{item.name}</span>}
      </>
    );

    if (collapsed) {
      return (
        <Tooltip key={`${item.href}-${index}`}>
          <TooltipTrigger asChild>
            <Link 
              href={item.href} 
              className={linkClasses} 
              aria-label={item.name}
            >
              {linkContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground text-sm rounded-md px-2 py-1 shadow-lg">
            <p>{item.name}</p>
          </TooltipContent>
        </Tooltip>
      );
    } else {
      return (
        <Link 
          key={`${item.href}-${index}`} 
          href={item.href} 
          className={linkClasses}
        >
          {linkContent}
        </Link>
      );
    }
  }, [currentPathname, collapsed]);
  
  return (
    <aside
      className={cn(
        "h-full bg-background text-sidebar-foreground flex flex-col"
      )}
    >
      <div className="p-2 flex items-center" style={{ justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md
                     hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-black/15 dark:focus:ring-white/20"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-black/60 dark:text-white/70" strokeWidth={2.25} />
          ) : (
            <ChevronLeft className="w-4 h-4 text-black/60 dark:text-white/70" strokeWidth={2.25} />
          )}
        </button>
      </div>

      <nav className={cn("flex-1 space-y-2 px-2 py-4 overflow-y-auto no-visual-scrollbar")}>
        {currentNavItems.length > 0 ? (
           currentNavItems.map((item, itemIndex) => renderNavItem(item, itemIndex))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Construction className="w-10 h-10 mb-2" />
            {!collapsed && (
              <span className="text-sm font-medium">Coming Soon</span>
            )}
          </div>
        )}
      </nav>
      <div className="mt-auto p-2 border-t border-sidebar-border/30">
        {renderNavItem(alertsNavItem, 999)} 
      </div>
    </aside>
  );
}
