
import { embed } from './embed';
import { saveKB } from './storage';

// Build the text line for a row. Adjust keys to your merged columns.
export function rowText(r: any): string {
  const ip = r.IP ?? '-';
  const acct = r['Account Number'] ?? r.account ?? '-';
  const value = r.Value ?? r.value ?? '-';
  const fees = r['Advisory Fees'] ?? r.fees ?? '-';
  const cash = r.Cash ?? r.cash ?? '-';
  const status = r.Status ?? '-';
  return `IP ${ip} | Account ${acct} | Value ${value} | Fees ${fees} | Cash ${cash} | Status ${status}`;
}

// Call this right after Run Report succeeds.
// mergedRows: Array<object> from your Python merge in the UI
export async function indexMergedRows(mergedRows: any[]) {
  const rows = [];
  for (const r of mergedRows) {
    const t = rowText(r);
    const e = await embed(t);
    rows.push({ r, t, e });
  }
  const columns = Object.keys(mergedRows?.[0] ?? {});
  await saveKB({ createdAt: Date.now(), columns, rows });
  return { count: rows.length };
}
