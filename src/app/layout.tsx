
"use client";

import { Inter, Roboto_Mono } from 'next/font/google';
import * as React from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { TickerProvider } from "@/contexts/ticker-context";

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

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased flex flex-col h-screen`}>
        <AuthProvider>
          <TickerProvider>
            <div className="flex flex-1 h-screen">
              <TooltipProvider delayDuration={0}>
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-transparent no-visual-scrollbar">
                  {children}
                </main>
              </TooltipProvider>
            </div>
            <Toaster />
          </TickerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
