
import { openDB } from 'idb';

const DB_NAME = 'ask-maven-db';
const STORE = 'kb';

type KBRow = { r: any; t: string; e: number[] };
export type KBPacket = { createdAt: number; columns: string[]; rows: KBRow[] };

export async function saveKB(kb: KBPacket) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(d) { if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE); }
  });
  await db.put(STORE, kb, 'current');
}

export async function loadKB(): Promise<KBPacket | null> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(d) { if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE); }
  });
  return (await db.get(STORE, 'current')) ?? null;
}

export async function clearKB() {
  const db = await openDB(DB_NAME, 1);
  await db.delete(STORE, 'current');
}
