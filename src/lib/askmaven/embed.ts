
let _embedder: any | null = null;

// Lazy-load transformers only on the client
export async function getEmbedder() {
  if (typeof window === 'undefined') throw new Error('embedder must run in browser');
  if (_embedder) return _embedder;

  const { pipeline } = await import('@xenova/transformers');
  // all-MiniLM-L6-v2 is small, fast, and good enough
  _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return _embedder;
}

// Returns a normalized embedding vector (number[])
export async function embed(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const out = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data) as number[]; // Float32Array -> number[]
}

// cosine for normalized vectors (equivalent to dot)
export function cosine(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
