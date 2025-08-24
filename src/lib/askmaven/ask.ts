import * as aq from 'arquero';
import { cosine, embed } from './embed';
import { loadKB } from './storage';

export type AskResult = { answer: string; evidence: string[] };

const NUMERIC_KEYS = ['Value','Advisory Fees','Cash'];  // adjust if your keys differ
const ALIASES: Record<string,string> = {
  value: 'Value', fee: 'Advisory Fees', fees: 'Advisory Fees', cash: 'Cash'
};
const normKey = (q: string) => ALIASES[q.toLowerCase()] ?? q;

function asNum(v: any) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[$,%,\s]/g,'');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

export async function askMaven(question: string): Promise<AskResult> {
  const kb = await loadKB();
  if (!kb?.rows?.length) {
    return { answer: 'No uploaded data found. Run the report first.', evidence: [] };
  }

  // --- retrieval ---
  const qVec = await embed(question);
  const ranked = kb.rows
    .map(x => ({ ...x, s: cosine(qVec, x.e) }))
    .sort((a, b) => b.s - a.s);
  const evidence = ranked.slice(0, 8).map(x => x.t);
  const table = aq.from(kb.rows.map(x => x.r));

  const q = question.trim().toLowerCase();

  // --- 1) TOP/BOTTOM N BY COLUMN ---
  // e.g., "top 10 accounts by cash", "bottom 5 by fees"
  const mTop = q.match(/\b(top|bottom)\s+(\d+)?\s*(?:accounts?|rows?)?\s*(?:by|on)\s+([a-z\s]+)\b/);
  if (mTop) {
    const dir = mTop[1] === 'top' ? 'desc' : 'asc';
    const N = mTop[2] ? parseInt(mTop[2],10) : 10;
    const col = normKey(mTop[3].trim());
    const out = table
      .derive({ metric: (d: any) => asNum(d[col]) })
      .orderby(dir === 'desc' ? aq.desc('metric') : aq.asc('metric'))
      .select('IP','Account Number', col)
      .objects()
      .slice(0, N);
    return {
      answer: `${mTop[1].toUpperCase()} ${out.length} by ${col}:\n` +
              out.map((r:any)=>`• ${r['Account Number']} — ${r[col]}`).join('\n'),
      evidence
    };
  }

  // --- 2) COUNT WHERE COL <|>|<=|>= NUMBER ---
  // e.g., "how many accounts where cash < fees", "count where cash < 500"
  const mCmp = q.match(/\b(count|how many).*(cash|fees|value)[^0-9<>]*(<=|>=|<|>)\s*\$?([\d,\.]+)/);
  if (mCmp) {
    const key = normKey(mCmp[2]);
    const op  = mCmp[3];
    const val = parseFloat(mCmp[4].replace(/,/g,''));
    const out = table
      .derive({ num: (d:any) => asNum(d[key]) })
      .filter((d:any) =>
        op === '<'  ? d.num <  val :
        op === '>'  ? d.num >  val :
        op === '<=' ? d.num <= val :
                      d.num >= val
      )
      .objects();
    return { answer: `Count where ${key} ${op} ${val}: ${out.length}`, evidence };
  }

  // --- 3) CASH < FEES (common ask) ---
  if (q.includes('cash') && q.includes('<') && q.includes('fee') || q.includes('short')) {
    const out = table
      .derive({
        cash_n: (d:any) => asNum(d['Cash']),
        fees_n: (d:any) => asNum(d['Advisory Fees'])
      })
      .filter((d:any) => d.cash_n < d.fees_n)
      .select('IP','Account Number','Cash','Advisory Fees')
      .objects();
    if (!out.length) return { answer: 'No accounts where Cash < Fees.', evidence };
    return {
      answer: `Accounts where Cash < Fees (${out.length}):\n` +
              out.slice(0,25).map((r:any)=>`• ${r['Account Number']} (Cash ${r.Cash}, Fees ${r['Advisory Fees']})`).join('\n'),
      evidence
    };
  }

  // --- 4) SUM/AVG ---
  // e.g., "total cash", "average fees"
  const mAgg = q.match(/\b(total|sum|average|avg)\s+(cash|fees|value)\b/);
  if (mAgg) {
    const agg = mAgg[1];
    const key = normKey(mAgg[2]);
    const nums = table.objects().map((r:any)=>asNum(r[key])).filter((n)=>Number.isFinite(n));
    if (!nums.length) return { answer: `No numeric data for ${key}.`, evidence };
    const sum = nums.reduce((a,b)=>a+b,0);
    const avg = sum / nums.length;
    const ans = agg.startsWith('avg') ? `Average ${key}: ${avg.toLocaleString()}` : `Total ${key}: ${sum.toLocaleString()}`;
    return { answer: ans, evidence };
  }

  // --- Fallback: show the most relevant rows ---
  return {
    answer: `Here’s what your data most closely points to:\n` + evidence.join('\n'),
    evidence
  };
}
