
"use client";
import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { useIsMobile } from "./use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:collapsed";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextType = {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) {
        setCollapsed(true);
        return;
    }
    const savedState = localStorage.getItem(SIDEBAR_COOKIE_NAME);
    setCollapsed(savedState === '1');
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
        // Mobile sidebar behavior might be different, e.g., an overlay
        // For now, let's assume we don't change the main collapsed state on mobile
        return;
    }
    setCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_COOKIE_NAME, newState ? '1' : '0');
      return newState;
    });
  }, [isMobile]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, isMobile, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
