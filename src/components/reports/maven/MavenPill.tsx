
'use client';

import { useEffect, useState } from 'react';
import { loadKB } from '@/lib/askmaven/storage';

export default function MavenPill({ onOpen }: { onOpen: () => void }) {
  const [kbReady, setKbReady] = useState(false);
  const [kbCount, setKbCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    // Enable if KB already exists (e.g., after Run Report or page refresh)
    loadKB().then(kb => {
      if (!alive) return;
      if (kb?.rows?.length) {
        setKbReady(true);
        setKbCount(kb.rows.length);
      }
    });

    // Enable whenever a fresh KB is indexed
    const onKB = (e: any) => {
      setKbReady(true);
      setKbCount(e?.detail?.count ?? null);
    };
    window.addEventListener('askmaven:kb-updated', onKB);

    return () => {
      alive = false;
      window.removeEventListener('askmaven:kb-updated', onKB);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        disabled={!kbReady}
        className={`rounded-full px-4 py-2 ${
          kbReady
            ? 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer'
            : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
        }`}
      >
        Maven
      </button>
      {kbReady && kbCount !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {kbCount}</span>
      )}
    </div>
  );
}
