
"use client";

import React from 'react';
import { useNavigation } from '@/contexts/navigation-context';
import { toolbarSections } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface TopToolbarProps {
  collapsed: boolean;
}

export function TopToolbar({ collapsed }: TopToolbarProps) {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <header className={cn(
      "fixed top-0 right-0 z-40 h-16 bg-black border-b border-gray-800/50 flex items-center px-4 shadow-md transition-all duration-300",
      collapsed ? "left-16" : "left-64"
    )}>
      <nav className="flex items-center space-x-2">
        {toolbarSections.map((section) => (
          <Button
            key={section.id}
            variant="ghost"
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out",
              "hover:bg-[#232323] hover:text-white",
              activeSection === section.id ? "bg-[#232323] text-white" : "bg-transparent"
            )}
          >
            {section.title}
          </Button>
        ))}
      </nav>
    </header>
  );
}
