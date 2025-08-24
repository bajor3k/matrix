'use client';

import useKBReady from './useKBReady';
import { Brain, Loader2 } from 'lucide-react';

export default function MavenPill({ onOpen, isLoading }: { onOpen: () => void, isLoading: boolean }) {
  const { ready, count } = useKBReady();

  return (
    <div className="flex items-center gap-2" data-maven-pill data-ready={String(ready)}>
      <button
        type="button"
        aria-label="Open Ask Maven"
        onClick={onOpen}
        disabled={!ready || isLoading}
        className={`relative inline-flex items-center gap-2 rounded-full h-11 px-4 border select-none transition-colors duration-150 font-semibold text-[var(--pill-font-size)]
          ${ready && !isLoading
            ? 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer ring-1 ring-white/15 hover:ring-white/25'
            : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
        }`}
        style={{ zIndex: 2 }}
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
