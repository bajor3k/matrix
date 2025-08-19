"use client";

import { Inter, Roboto_Mono } from 'next/font/google';
import * as React from 'react';
import Script from 'next/script';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { TopToolbar } from '@/components/TopToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isReportPage = pathname.startsWith('/reports');

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
      <head>
          {isReportPage && (
            <>
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/assets/iconfont/iconfont.css' />
            </>
          )}
      </head>
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
                {isLandingPage ? (
                  <>{children}</>
                ) : (
                  <div className="flex flex-1">
                    <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
                    <div className="flex flex-col flex-1 min-h-0">
                      <TopToolbar collapsed={sidebarCollapsed} />
                      <main className="flex-1 bg-transparent overflow-y-auto no-visual-scrollbar pt-16">
                        {children}
                      </main>
                    </div>
                  </div>
                )}
                <Toaster />
              </TooltipProvider>
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
        {isReportPage && (
          <>
            <Script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/xlsx@0.20.2/dist/xlsx.full.min.js" strategy="lazyOnload" />
            <Script src="https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js" strategy="lazyOnload" />
            <Script src="https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js" strategy="lazyOnload" />
          </>
        )}
      </body>
    </html>
  );
}
