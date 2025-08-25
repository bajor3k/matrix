
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
    <header className="mx-auto flex h-full max-w-screen-2xl items-center gap-6 px-4">
      <div className="flex items-center gap-2">
        <Link
            href="/dashboard"
            aria-label="Go to dashboard home"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
        >
            <Brain className="w-5 h-5 text-gray-200 dark:text-white/70" />
        </Link>
      </div>

      <nav className="flex items-center gap-6 text-sm font-medium">
        {toolbarSections.map((section) => (
            <Link
                key={section.id}
                href={`/${section.title.toLowerCase()}`}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                    "transition-colors",
                    activeSection === section.id 
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                )}
            >
            {section.title}
            </Link>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2">
        <FullscreenToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
