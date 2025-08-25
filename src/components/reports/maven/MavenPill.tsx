'use client';

import useKBReady from './useKBReady';
import { Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MavenPill({ onOpen, isLoading }: { onOpen: () => void, isLoading: boolean }) {
  const { ready, count } = useKBReady();

  return (
    <div className="flex items-center gap-2" data-maven-pill data-ready={String(ready)}>
      <button
        type="button"
        aria-label="Open Ask Maven"
        onClick={onOpen}
        disabled={!ready || isLoading}
        className={cn(
            "inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors duration-150 font-medium text-[var(--pill-font-size)]",
            "border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "disabled:opacity-55 disabled:cursor-not-allowed",
            "disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        )}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        <span>Maven</span>
      </button>
      {ready && !isLoading && count !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {count}</span>
      )}
    </div>
  );
}
