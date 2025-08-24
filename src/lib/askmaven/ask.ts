
import * as aq from 'arquero';
import { cosine, embed } from './embed';
import { loadKB } from './storage';

export type AskResult = { answer: string; evidence: string[] };

export async function askMaven(question: string): Promise<AskResult> {
  const kb = await loadKB();
  if (!kb || !kb.rows?.length) {
    return { answer: 'No uploaded data found. Please run the report first.', evidence: [] };
  }

  const qVec = await embed(question);
  const ranked = kb.rows
    .map(x => ({ ...x, s: cosine(qVec, x.e) }))
    .sort((a, b) => b.s - a.s);

  const top = ranked.slice(0, 12); // evidence
  const evidence = top.slice(0, 8).map(x => x.t);

  // Attempt simple analytics when the question hints at ranking/thresholds
  const t = question.toLowerCase();
  const table = aq.from(kb.rows.map(x => x.r));

  const asNumber = (v: any) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,]/g, '')));

  try {
    if (t.includes('top') && (t.includes('cash') || t.includes('value') || t.includes('fees'))) {
      const key = t.includes('cash') ? 'Cash' : t.includes('fees') ? 'Advisory Fees' : 'Value';
      const out = table
        .derive({ metric: (d: any) => asNumber(d[key]) })
        .orderby(aq.desc('metric'))
        .select('IP','Account Number', key)
        .objects()
        .slice(0, 10);
      return {
        answer: `Top by ${key}:` + (out.length ? '\n' + out.map((r:any)=>`• ${r['Account Number']} — ${r[key]}`).join('\n') : ' none'),
        evidence
      };
    }
    if ((t.includes('less than') || t.includes('<') || t.includes('short')) && (t.includes('cash') || t.includes('fees'))) {
      const out = table
        .derive({
          cash_n: (d:any) => asNumber(d['Cash']),
          fees_n: (d:any) => asNumber(d['Advisory Fees'])
        })
        .filter((d:any) => d.cash_n < d.fees_n)
        .select('IP','Account Number','Cash','Advisory Fees')
        .objects();
      return {
        answer: out.length
          ? `Accounts where Cash < Fees (${out.length}):\n` + out.slice(0,20).map((r:any)=>`• ${r['Account Number']} (Cash ${r.Cash}, Fees ${r['Advisory Fees']})`).join('\n')
          : 'No accounts where Cash < Fees.',
        evidence
      };
    }
  } catch (e) {
    // fall through to generic summary
  }

  // Generic fallback: list the most relevant rows as the answer (no LLM)
  return {
    answer: `Here’s what your data most closely points to:\n` + evidence.join('\n'),
    evidence
  };
}
