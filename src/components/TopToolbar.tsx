
"use client";

import React from 'react';
import { useNavigation } from '@/contexts/navigation-context';
import { toolbarSections } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { Brain } from 'lucide-react';

interface TopToolbarProps {
  onToggleSidebar: () => void;
}

export function TopToolbar({ onToggleSidebar }: TopToolbarProps) {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <header className="h-[56px] flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5"
        >
          <Brain className="w-5 h-5 text-white/70" />
        </button>
        <span className="h-6 w-px bg-white/10" />
        <nav className="flex items-center space-x-1">
          {toolbarSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "px-3 py-1.5 h-auto rounded-md text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === section.id ? "bg-accent text-accent-foreground" : "bg-transparent"
              )}
            >
              {section.title}
            </Button>
          ))}
        </nav>
      </div>
      <ThemeToggle />
    </header>
  );
}
