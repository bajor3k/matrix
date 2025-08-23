
"use client";

import React from 'react';
import Link from 'next/link';
import { useNavigation } from '@/contexts/navigation-context';
import { toolbarSections } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { Brain } from 'lucide-react';
import FullscreenToggle from './chrome/FullscreenToggle';

export function TopToolbar() {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <header className="h-[56px] flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <Link
            href="/dashboard"
            aria-label="Go to dashboard home"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
        >
            <Brain className="w-5 h-5 text-gray-600 dark:text-white/70" />
        </Link>
        <nav className="flex items-center space-x-1">
          {toolbarSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "px-3 py-1.5 h-auto rounded-md text-sm font-medium transition-colors duration-150 ease-out",
                "text-gray-700 dark:text-foreground/80",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === section.id 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-transparent"
              )}
            >
              {section.title}
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <FullscreenToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
