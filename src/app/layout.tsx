
"use client";

import { Inter, Roboto_Mono } from 'next/font/google';
import * as React from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { TopToolbar } from '@/components/TopToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    } else {
      const storedCollapsed = localStorage.getItem("matrix-sidebar-collapsed");
      if (storedCollapsed !== null) {
        setSidebarCollapsed(storedCollapsed === "true");
      }
    }
  }, [isMobile]);

  const handleToggleSidebar = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    if (!isMobile) {
        localStorage.setItem("matrix-sidebar-collapsed", String(newCollapsedState));
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased flex flex-col h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavigationProvider>
              <TooltipProvider delayDuration={0}>
                <TopToolbar collapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
                <div className="flex flex-1 pt-16">
                  <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
                  <main className="flex-1 overflow-y-auto bg-transparent no-visual-scrollbar">
                    {children}
                  </main>
                </div>
                <Toaster />
              </TooltipProvider>
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
