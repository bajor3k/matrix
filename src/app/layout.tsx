"use client";

import { Inter, Roboto_Mono } from 'next/font/google';
import * as React from 'react';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';

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
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isReportPage = pathname.startsWith('/reports');

  React.useEffect(() => {
    const runDevExpose = async () => {
      if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
        try {
          await import('@/lib/askmaven/dev-expose');
        } catch (err) {
          console.warn("AskMaven dev-expose utility failed to load:", err);
        }
      }
    };
    runDevExpose();
  }, []);

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
                  <AppShell>{children}</AppShell>
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
