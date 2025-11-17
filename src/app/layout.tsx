
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
import VaultGate from "./VaultGate";


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
      </body>
    </html>
  );
}
