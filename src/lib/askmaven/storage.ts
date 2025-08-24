import { openDB } from 'idb';

const DB_NAME = 'ask-maven-db';
const STORE = 'kb';

type KBRow = { r: any; t: string; e: number[] };
export type KBPacket = { createdAt: number; columns: string[]; rows: KBRow[] };

async function open() {
  return openDB(DB_NAME, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    }
  });
}

export async function saveKB(kb: KBPacket) {
  const db = await open();
  await db.put(STORE, kb, 'current');
}

export async function loadKB(): Promise<KBPacket | null> {
  const db = await open();
  return (await db.get(STORE, 'current')) ?? null;
}

export async function clearKB() {
  try {
    const db = await open();
    // If key doesn't exist, delete() will no-op
    await db.delete(STORE, 'current');
  } catch {
    // swallow; database will be created lazily on next save
  }
}
