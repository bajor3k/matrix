
"use client";

import React from 'react';
import Link from 'next/link';
import { Brain, ChevronLeft, ChevronRight, LogIn, LogOut, Loader2 } from 'lucide-react';
import FullscreenToggle from './chrome/FullscreenToggle';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/auth-context';

interface TopToolbarProps {
    onToggleCollapsed: () => void;
    collapsed: boolean;
}

export function TopToolbar({ onToggleCollapsed, collapsed }: TopToolbarProps) {
  const { user, isLoading, signInWithGoogleAndGetGmailToken, signOutGoogle } = useAuth();

  return (
    <header className="flex h-full w-full items-center gap-3 px-4">
      {/* LEFT CLUSTER */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/dashboard"
          aria-label="Go to dashboard home"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent"
        >
          <Brain className="w-5 h-5 text-foreground/70" />
        </Link>
        <Button
          onClick={onToggleCollapsed}
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* RIGHT CLUSTER — STAYS AT FAR RIGHT */}
      <div className="ml-auto flex items-center gap-2">
        <FullscreenToggle />
        <ThemeToggle />
         {isLoading ? (
            <Button variant="outline" size="sm" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        ) : user ? (
            <Button variant="outline" size="sm" onClick={signOutGoogle}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        ) : (
            <Button variant="outline" size="sm" onClick={signInWithGoogleAndGetGmailToken}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
            </Button>
        )}
      </div>
    </header>
  );
}
