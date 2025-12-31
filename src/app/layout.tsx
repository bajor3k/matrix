
import './globals.css';
import { fontSans, fontMono } from "./fonts";
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from '@/contexts/navigation-context';
import { ThemeProvider } from '@/components/theme-provider';
import AppShell from '@/components/AppShell';
import VaultGate from "./VaultGate";
import { ChevronLeft } from "lucide-react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <head />
      <body className="bg-black text-zinc-100">
        <VaultGate>
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
          
        </VaultGate>
        {/* --- START: Right Chevron (Replaces Thumbs Up) --- */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-1 bg-background/40 backdrop-blur-sm rounded-l-md border-y border-l border-border/20 dark:border-white/5 shadow-sm cursor-default">
          <ChevronLeft className="h-6 w-6 text-muted-foreground opacity-50" />
        </div>
        {/* --- END: Right Chevron --- */}
      </body>
    </html>
  );
}
