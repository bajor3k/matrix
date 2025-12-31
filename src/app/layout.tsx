
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
import { ClientLayout } from "@/components/ClientLayout";
import Image from 'next/image';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <head />
      <body className="bg-black text-zinc-100">
        <ClientLayout>
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
        </ClientLayout>

        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="relative h-16 w-16 animate-pulse">
            <Image 
              src="/icons/animated/brain-logo.svg" 
              alt="Matrix AI" 
              fill 
              className="object-contain grayscale invert opacity-80"
            />
          </div>
        </div>
        
      </body>
    </html>
  );
}
