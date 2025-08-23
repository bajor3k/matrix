
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
import { cn } from '@/lib/utils';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar.tsx';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isReportPage = pathname.startsWith('/reports');

  React.useEffect(() => {
    if (isMobile) {
      // Logic to handle mobile state if needed, though useSidebar might handle it
    }
  }, [isMobile]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          {isReportPage && (
            <>
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css' />
              <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/assets/iconfont/iconfont.css' />
              <Script src="https://cdn.plot.ly/plotly-2.32.0.min.js" strategy="lazyOnload" />
            </>
          )}
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased h-screen`}>
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
                  <div className="grid min-h-screen grid-rows-[56px,1fr] grid-cols-[auto,1fr] bg-background text-foreground">
                    <header className="row-[1] col-[1/3] z-50 sticky top-0 bg-background/95 border-b border-white/10 backdrop-blur">
                        <TopToolbar onToggleSidebar={toggleSidebar} />
                    </header>
                    <aside className={cn(
                        "row-[2] col-[1] border-r border-white/10 transition-all duration-300",
                        collapsed ? "w-16" : "w-64"
                    )}>
                        <Sidebar collapsed={collapsed} />
                    </aside>
                    <main className="row-[2] col-[2] overflow-y-auto no-visual-scrollbar">
                        {children}
                    </main>
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppLayout>{children}</AppLayout>
        </SidebarProvider>
    )
}
