
"use client";

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function PositionsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <div className="flex items-center gap-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Positions</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client or account..."
            className="pl-9 bg-card border-none shadow-white-glow-soft hover:shadow-white-glow-hover transition-shadow duration-200 ease-out"
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center h-[60vh] bg-card/50 rounded-lg border border-dashed border-border/50">
        <p className="text-xl font-semibold text-foreground mb-2">
          Positions Page
        </p>
        <p className="text-muted-foreground">
          This section is currently under construction.
        </p>
      </div>
    </main>
  );
}
