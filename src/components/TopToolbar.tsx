"use client";

import React from 'react';
import { useNavigation } from '@/contexts/navigation-context';
import { toolbarSections } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';

export function TopToolbar() {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <header className={cn(
      "sticky top-0 z-50 h-16 shrink-0 bg-background/95 backdrop-blur-sm border-b flex items-center px-4 shadow-sm"
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
