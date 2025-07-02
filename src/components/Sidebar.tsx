
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  TrendingUp,
  Repeat,
  ShieldAlert,
  LayoutGrid,
  PieChart,
  Shapes,
  FlaskConical,
  BellRing,
  AppWindow,
  Home as HomeIcon,
  Mail,
  Contact as ContactIcon,
  ListChecks,
  CalendarDays,
  Briefcase,
  Workflow,
  KanbanSquare,
  FileText,
  BarChart2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasNewAlerts?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navSectionsData: NavSection[] = [
  {
    id: 'clientPortal',
    title: 'CRM',
    icon: AppWindow,
    items: [
      { name: 'Home', icon: HomeIcon, href: '/client-portal/home' },
      { name: 'Email', icon: Mail, href: '/client-portal/email' },
      { name: 'Contacts', icon: ContactIcon, href: '/client-portal/contacts' },
      { name: 'Tasks', icon: ListChecks, href: '/client-portal/tasks' },
      { name: 'Workflows', icon: Workflow, href: '/client-portal/workflows'},
      { name: 'Calendar', icon: CalendarDays, href: '/client-portal/calendar' },
      { name: 'Opportunities', icon: Briefcase, href: '/client-portal/opportunities' },
      { name: 'Projects', icon: KanbanSquare, href: '/client-portal/projects'},
      { name: 'Files', icon: FileText, href: '/client-portal/files'},
      { name: 'Reports', icon: BarChart2, href: '/client-portal/reports' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    items: [
      { name: 'Asset Analytics', icon: BarChart3, href: '/asset-analytics' },
      { name: 'Client Analytics', icon: Users, href: '/client-analytics' },
      { name: 'Financial Analytics', icon: TrendingUp, href: '/financial-analytics' },
      { name: 'Conversion Analytics', icon: Repeat, href: '/conversion-analytics' },
      { name: 'Compliance Matrix', icon: ShieldAlert, href: '/compliance-matrix'},
      { name: 'Portfolio Matrix', icon: PieChart, href: '/portfolio-matrix' },
      { name: 'Model Matrix', icon: Shapes, href: '/model-matrix' },
      { name: 'Contribution Matrix', icon: TrendingUp, href: '/contribution-matrix' },
      { name: 'Project X', icon: FlaskConical, href: '/project-x' },
      { name: 'Resource Matrix', icon: LayoutGrid, href: '/resource-matrix' },
    ],
  },
];

const alertsNavItem: NavItem = {
  name: 'Alerts',
  icon: BellRing,
  href: '/alerts',
  hasNewAlerts: true, // Mock this for now
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false); // Default to expanded for SSR and initial client render
  const [isClient, setIsClient] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const currentPathname = usePathname();

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedCollapsed = localStorage.getItem("matrix-sidebar-collapsed");
      if (storedCollapsed !== null) {
        setCollapsed(storedCollapsed === "true");
      }

      const initialOpenState: Record<string, boolean> = {};
      const storedSectionsState = localStorage.getItem("matrix-sidebar-sections-open");
      const effectiveCollapsed = storedCollapsed === "true";

      if (storedSectionsState && !effectiveCollapsed) {
          try {
              const parsedStored = JSON.parse(storedSectionsState);
              navSectionsData.forEach(section => {
                  initialOpenState[section.id] = parsedStored.hasOwnProperty(section.id) ? parsedStored[section.id] : true;
              });
          } catch (e) {
              navSectionsData.forEach(section => { initialOpenState[section.id] = true; });
          }
      } else {
          navSectionsData.forEach(section => { initialOpenState[section.id] = !effectiveCollapsed; });
      }
      setOpenSections(initialOpenState);
    }
  }, [isClient]);

  const currentDisplayCollapsed = isClient ? collapsed : false;

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("matrix-sidebar-collapsed", String(collapsed));
      if (!collapsed) { // Only save section states if sidebar is expanded
        localStorage.setItem("matrix-sidebar-sections-open", JSON.stringify(openSections));
      }
    }
  }, [collapsed, openSections, isClient]);
  
  const toggleSidebar = useCallback(() => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (newCollapsedState) {
        // When collapsing, save the current open sections state
        localStorage.setItem("matrix-sidebar-sections-open", JSON.stringify(openSections));
    } else {
        // When expanding, try to restore or default open section states
        const storedSectionsState = localStorage.getItem("matrix-sidebar-sections-open");
        const restoredOpenState: Record<string, boolean> = {};
        if (storedSectionsState) {
            try {
                const parsedStored = JSON.parse(storedSectionsState);
                navSectionsData.forEach(section => {
                    restoredOpenState[section.id] = parsedStored.hasOwnProperty(section.id) ? parsedStored[section.id] : true;
                });
            } catch (e) { // Fallback if JSON is malformed
                navSectionsData.forEach(section => { restoredOpenState[section.id] = true; });
            }
        } else { // Default to all open if no stored state
            navSectionsData.forEach(section => { restoredOpenState[section.id] = true; });
        }
        setOpenSections(restoredOpenState);
    }
  }, [collapsed, openSections, isClient]);

  const toggleSection = useCallback((sectionId: string) => {
    if (!currentDisplayCollapsed && isClient) { // Only allow toggling sections if expanded and on client
      setOpenSections(prev => {
        const newState = { ...prev, [sectionId]: !prev[sectionId] };
        return newState;
      });
    }
  }, [currentDisplayCollapsed, isClient]);

  const renderNavItem = useCallback((item: NavItem, index: number) => {
    const isActive = currentPathname === item.href || (currentPathname.startsWith(item.href + '/') && item.href !== '/');
    
    const iconClasses = cn(
      "w-5 h-5 shrink-0 transition-colors duration-200",
      isActive 
        ? "text-sidebar-foreground" 
        : item.hasNewAlerts && isClient 
          ? "animate-red-pulse text-red-500" 
          : "text-sidebar-foreground/70 group-hover/navitem:text-sidebar-foreground"
    );

    const linkClasses = cn(
      "flex items-center gap-4 px-4 py-2.5 rounded-[8px] transition-all duration-200 ease-out group/navitem",
      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/[.05] hover:-translate-y-px",
      currentDisplayCollapsed && "justify-center p-2.5"
    );

    const linkContent = (
      <>
        <item.icon className={iconClasses} />
        {!currentDisplayCollapsed && <span className="truncate text-base font-medium">{item.name}</span>}
      </>
    );

    if (currentDisplayCollapsed) {
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
  }, [currentPathname, isClient, currentDisplayCollapsed]);
  
  return (
    <aside
      className={cn(
        "h-full bg-black/90 border-r border-gray-800/50 text-white transition-all duration-300 flex flex-col",
        currentDisplayCollapsed ? "w-16" : "w-64" 
      )}
    >
      <div className={cn("flex items-center p-4 px-5", currentDisplayCollapsed ? "justify-center" : "justify-between")}>
        <Link href="/dashboard" className={cn("flex items-center", currentDisplayCollapsed ? "justify-center w-full" : "space-x-3 group")}>
          <Brain className={cn("text-gray-400", currentDisplayCollapsed ? "w-8 h-8" : "w-10 h-10")} />
          {!currentDisplayCollapsed && (
            <span className="text-4xl font-bold text-metallic-gradient leading-tight group-hover:brightness-110 transition-all">
              Matrix
            </span>
          )}
        </Link>
        {!currentDisplayCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      {currentDisplayCollapsed && (
        <div className="flex justify-center items-center py-2 border-t border-b border-sidebar-border/30">
           <button
            onClick={toggleSidebar}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <nav className={cn("flex-1 space-y-1 px-2 py-4 overflow-y-auto no-visual-scrollbar")}>
        {currentDisplayCollapsed ? (
          navSectionsData.flatMap((section, sectionIndex) => section.items.map((item, itemIndex) =>
            renderNavItem(item, sectionIndex * 100 + itemIndex) // Ensure unique keys for flat list
          ))
        ) : (
          navSectionsData.map((section) => (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "flex items-center w-full text-left px-4 py-3 rounded-md hover:bg-black/30 transition-colors duration-150 ease-out group/section",
                  "border-b border-sidebar-border/30" 
                )}
                aria-expanded={openSections[section.id]}
              >
                <section.icon className="w-5 h-5 shrink-0 text-gray-400 group-hover/section:text-gray-200" />
                <span className={cn(
                  "ml-3 font-bold text-lg tracking-wider truncate flex-1 group-hover/section:text-gray-100 text-gray-300",
                  section.title !== 'Analytics' && "uppercase"
                )}>
                    {section.title}
                </span>
                <ChevronDown
                    className={cn(
                    "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-hover/section:text-gray-200",
                    openSections[section.id] && "rotate-180"
                    )}
                />
              </button>
              {openSections[section.id] && (
                <div className="mt-1 space-y-1 py-2 pl-4 border-l border-sidebar-border/20">
                  {section.items.map((item, itemIndex) => renderNavItem(item, itemIndex))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>
      <div className="mt-auto p-2 border-t border-sidebar-border/30">
        {renderNavItem(alertsNavItem, 999)} 
      </div>
    </aside>
  );
}
