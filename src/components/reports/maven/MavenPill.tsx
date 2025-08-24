'use client';

import useKBReady from './useKBReady';

export default function MavenPill({ onOpen }: { onOpen: () => void }) {
  const { ready, count } = useKBReady();

  return (
    <div className="flex items-center gap-2" data-maven-pill data-ready={String(ready)}>
      <button
        type="button"
        onClick={onOpen}
        disabled={!ready}
        className={`rounded-full px-4 py-2 ${
          ready ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
        }`}
        style={{ position: 'relative', zIndex: 2 }}
      >
        Maven
      </button>
      {ready && count !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {count}</span>
      )}
    </div>
  );
}
