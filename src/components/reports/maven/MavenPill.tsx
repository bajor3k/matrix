'use client';

import useKBReady from './useKBReady';
import { Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MavenPill({ onOpen, isLoading, disabled }: { onOpen: () => void, isLoading: boolean, disabled?: boolean }) {
  const { ready, count } = useKBReady();

  return (
    <div className="flex items-center gap-2" data-maven-pill data-ready={String(ready)}>
      <button
        type="button"
        aria-label="Open Ask Maven"
        onClick={onOpen}
        disabled={disabled || !ready || isLoading}
        className={cn(
            "inline-flex items-center gap-2 rounded-full h-9 px-3 border select-none transition-colors duration-150 font-medium text-xs",
            "border-white/20 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white",
            "disabled:opacity-55 disabled:cursor-not-allowed",
            "disabled:hover:bg-transparent disabled:hover:text-zinc-300"
        )}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
        <span>Maven</span>
      </button>
      {ready && !isLoading && count !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {count}</span>
      )}
    </div>
  );
}
