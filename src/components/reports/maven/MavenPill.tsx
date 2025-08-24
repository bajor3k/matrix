'use client';

import { useEffect, useState } from 'react';
import { loadKB } from '@/lib/askmaven/storage';

export default function MavenPill({ onOpen }: { onOpen: () => void }) {
  const [kbReady, setKbReady] = useState(false);
  const [kbCount, setKbCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    // 1) initial check
    loadKB().then(kb => {
      if (!alive) return;
      const ok = Boolean(kb?.rows?.length);
      setKbReady(ok);
      setKbCount(ok ? kb!.rows.length : null);
      console.log('[MavenPill] initial KB check:', ok ? `rows=${kb!.rows.length}` : 'none');
    });

    // 2) react to fresh indexing (if event arrives)
    const onKB = (e: any) => {
      if (!alive) return;
      setKbReady(true);
      setKbCount(e?.detail?.count ?? null);
      console.log('[MavenPill] event: kb-updated', e?.detail);
    };
    window.addEventListener('askmaven:kb-updated', onKB);

    // 3) POLLING FALLBACK: re-check every 800ms until ready
    const iv = setInterval(async () => {
      if (!alive || kbReady) return;
      const kb = await loadKB();
      const ok = Boolean(kb?.rows?.length);
      if (ok) {
        setKbReady(true);
        setKbCount(kb!.rows.length);
        console.log('[MavenPill] polling found KB:', kb!.rows.length);
        clearInterval(iv);
      }
    }, 800);

    return () => {
      alive = false;
      window.removeEventListener('askmaven:kb-updated', onKB);
      clearInterval(iv);
    };
  }, [kbReady]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        disabled={!kbReady}
        data-kbready={kbReady}
        className={`rounded-full px-4 py-2 ${
          kbReady
            ? 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer'
            : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
        }`}
        style={{ position: 'relative', zIndex: 2 }} // keep above any overlay
      >
        Maven
      </button>
      {kbReady && kbCount !== null && (
        <span className="text-xs text-emerald-400">Knowledge • {kbCount}</span>
      )}
    </div>
  );
}
