import './globals.css';
import { fontSans, fontMono } from "./fonts";
import * as React from 'react';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { ThemeProvider } from '@/components/theme-provider';
import AppShell from '@/components/AppShell';
import DevTools from '@/components/DevTools';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isReportPage = false; // This will need to be derived from props or context in a real app

  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
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
      <body className="antialiased h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavigationProvider>
              <TooltipProvider delayDuration={0}>
                <AppShell>{children}</AppShell>
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
        <DevTools />
      </body>
    </html>
  );
}
