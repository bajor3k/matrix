
"use client";

import React from 'react';
import { useNavigation } from '@/contexts/navigation-context';
import { toolbarSections } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';

interface TopToolbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function TopToolbar({ collapsed, onToggleSidebar }: TopToolbarProps) {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <header className={cn(
      "fixed top-0 right-0 z-40 h-16 bg-background border-b flex items-center px-4 shadow-sm transition-all duration-300",
      collapsed ? "left-16" : "left-64"
    )}>
      <div className="flex w-full justify-between items-center">
        <nav className="flex items-center space-x-2">
          {toolbarSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === section.id ? "bg-accent text-accent-foreground" : "bg-transparent"
              )}
            >
              {section.title}
            </Button>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
