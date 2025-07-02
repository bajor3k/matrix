
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useCallback } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  BellRing,
  Brain,
  Construction,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { NavItem } from "@/contexts/navigation-context";
import { useNavigation } from "@/contexts/navigation-context";
import { navigationData } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const alertsNavItem: NavItem = {
  name: 'Alerts',
  icon: BellRing,
  href: '/alerts',
  hasNewAlerts: true,
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const currentPathname = usePathname();
  const { activeSection } = useNavigation();

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
        "h-full bg-background border-r text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64" 
      )}
    >
      <div className={cn("flex flex-col items-center pt-4 pb-3 px-2")}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href="/dashboard" className="mb-3">
                    <Brain className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors brain-glow" />
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p>Dashboard</p>
            </TooltipContent>
        </Tooltip>
      </div>
      
      <nav className={cn("flex-1 space-y-2 px-2 py-4 overflow-y-auto no-visual-scrollbar border-t border-sidebar-border/30")}>
        <div className={cn("flex mb-2", collapsed ? "justify-center" : "justify-end pr-2")}>
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </div>
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
