
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
// @ts-ignore types may lag
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
// @ts-ignore SDK evolves; keep this import flexible
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

const BUCKET = process.env.BUCKET!;
const FFMPEG_RUN_URL = process.env.FFMPEG_RUN_URL!;
const DOC_AI_PROJECT = process.env.DOC_AI_PROJECT!;
const DOC_AI_LOCATION = process.env.DOC_AI_LOCATION!;
const DOC_AI_PROCESSOR_ID = process.env.DOC_AI_PROCESSOR_ID!;
const GENAI_API_KEY = process.env.GENAI_API_KEY!; // set in Functions env

type StmtType = "monthly" | "quarterly" | "annual";

export const processRenderJob = functions.firestore
  .document("renderJobs/{jobId}")
  .onCreate(async (snap, ctx) => {
    const jobId = ctx.params.jobId;
    const job = snap.data();

    // lock the job
    await snap.ref.update({
      status: "parsing",
      workerId: process.env.GCF_INSTANCE || "local",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      const paths = planPaths(job);
      // 1) Parse PDF → JSON
      const parsed = await parseWithDocAI(job.bucket, job.filePath);
      await saveJson(paths.parseResultPath, parsed);

      // 2) Compute KPIs
      await snap.ref.update({ status: "kpis", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const kpis = computeKPIs(parsed, job.statementType as StmtType, job.period);
      await saveJson(paths.kpisPath, kpis);

      // 3) Plan scenes (prompt lives in code; UI is zero-config)
      await snap.ref.update({ status: "scripting", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const scenes = await planScenes(kpis, {
        clientName: job.clientName,
        stmtType: job.statementType,
        period: job.period,
      });
      await saveJson(paths.scenesPath, scenes);

      // 4) Render scenes with Veo-3 (8s clips), store to clips/
      await snap.ref.update({ status: "rendering", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const clipPaths: string[] = [];
      for (let i = 0; i < scenes.length; i++) {
        const out = await renderVeoClip(scenes[i]);
        const objectPath = `${paths.baseDir}/clips/scene-${i + 1}.mp4`;
        await uploadBuffer(objectPath, out, "video/mp4");
        clipPaths.push(objectPath);
      }

      // 5) Stitch in Cloud Run FFmpeg → final MP4
      const finalPath = `${paths.baseDir}/final.mp4`;
      await stitchClips(clipPaths, finalPath, {
        brand: { logoTopRight: true },
        captionsPath: null, // you can add later
      });

      // 6) Save & mark done
      await snap.ref.update({
        status: "complete",
        outputVideoPath: finalPath,
        parseResultPath: paths.parseResultPath,
        kpisPath: paths.kpisPath,
        scenesPath: paths.scenesPath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Job failed", err);
      await snap.ref.update({
        status: "failed",
        error: String(err?.message || err),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

function planPaths(job: any) {
  const safeClient = (job.clientName || "client").toString().trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-");
  const baseDir = `videos/${safeClient}/${job.statementType}/${job.period}/${(job.id || "job")}`;
  return {
    baseDir,
    parseResultPath: `${baseDir}/parsed.json`,
    kpisPath: `${baseDir}/kpis.json`,
    scenesPath: `${baseDir}/scenes.json`,
  };
}

/** ---------- PARSE (Document AI) ---------- */
async function parseWithDocAI(bucket: string, objectPath: string) {
  const client = new DocumentProcessorServiceClient();
  const name = `projects/${DOC_AI_PROJECT}/locations/${DOC_AI_LOCATION}/processors/${DOC_AI_PROCESSOR_ID}`;
  const gcsInput = `gs://${bucket}/${objectPath}`;

  const [result] = await client.processDocument({
    name,
    rawDocument: undefined as any,
    // Use GCS input (set in inline doc for simplicity)
    // If your processor prefers GCS, use "inlineDocument" with gcsUri in "document" instead.
    // Here we use "document" with "gcsDocument".
    document: { gcsDocument: { gcsUri: gcsInput, mimeType: "application/pdf" } } as any,
  });

  // Normalize: return text + key-value table rows if available.
  const doc = result.document || {};
  return {
    text: doc.text || "",
    // extend: parse entities/fields if your processor outputs them
    // entities: doc.entities || []
  };
}

/** ---------- KPI LOGIC (customize to your custodians) ---------- */
function computeKPIs(parsed: any, type: StmtType, period: string) {
  // TODO: replace with your real extraction logic
  // For now, dumb placeholders to prove pipeline
  return {
    type,
    period,
    performance: { periodReturnPct: 1.23, ytdPct: 5.67, benchmarkPct: 0.8 },
    flows: { contributions: 2500, withdrawals: 0, dividends: 120 },
    fees: { periodUsd: 45.12, ytdUsd: 320.88 },
    allocation: { equity: 62, fixed: 28, alts: 5, cash: 5 },
    notes: ["Auto-generated KPIs; replace with real parser."],
  };
}

/** ---------- SCENE PLANNER (Gemini prompt) ---------- */
async function planScenes(kpis: any, ctx: { clientName: string; stmtType: StmtType; period: string; }) {
  const genAI = new GoogleGenerativeAI(GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const system = `
You generate a concise storyboard for a ${ctx.stmtType} investment statement video.
Return an array of 4–6 scenes. Each scene is 8s max and includes:
- title: short on-screen text
- onScreen: 1–2 lines of overlay copy (<=50 chars/line)
- voiceover: 1 sentence, plain and factual, no advice
- veoPrompt: a visual prompt for Veo-3 (style, camera, motion, tone), dark UI aesthetic, finance theme, minimalist
- kpiCallouts: list of {label, value} derived ONLY from provided KPIs
Tone: calm, professional. Never invent numbers.
If numbers are missing, omit that callout.
Include intro ("${ctx.clientName} • ${prettyPeriod(ctx)}") and outro with disclosure: "AI-assisted summary. See statement for details."
Return strict JSON only.
  `.trim();

  const user = JSON.stringify({ kpis, context: ctx });

  const resp = await model.generateContent([{ role: "system", parts: [{ text: system }] }, { role: "user", parts: [{ text: user }] }]);
  const text = resp.response.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error("Scene planner did not return JSON"); }
  return json;
}

function prettyPeriod(ctx: { stmtType: StmtType; period: string; }) {
  if (ctx.stmtType === "monthly") {
    // "2025-06" → "June 2025"
    const [y, m] = ctx.period.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }
  if (ctx.stmtType === "quarterly") return ctx.period.replace("-", " ");
  return ctx.period; // annual
}

type Scene = {
  title: string;
  onScreen?: string;
  voiceover?: string;
  veoPrompt: string; // visual description
};

/** Return an MP4 Buffer for this scene (<=8s). */
async function renderVeoClip(scene: Scene): Promise<Buffer> {
  if (GENAI_API_KEY) {
    // TODO: Replace with the official Veo-3 SDK/API.
    // Pseudo-call shown for structure only.
    // const veo = new VeoClient({ apiKey: GENAI_API_KEY }).video("veo-3");
    // const resp = await veo.generate({
    //   prompt: scene.veoPrompt,
    //   durationSeconds: 8,
    //   resolution: "1080p",
    //   enableNativeAudio: true
    // });
    // return Buffer.from(await resp.arrayBuffer());
    throw new Error("Veo-3 SDK call not wired yet. Remove this throw when integrated.");
  }

  // Fallback: ask Cloud Run to create an 8s slate clip, then download it.
  const outputPath = `gs://${process.env.BUCKET}/_tmp/slates/${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`;
  const r = await fetch(`${FFMPEG_RUN_URL}/slate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: scene.title || "Video Reports",
      durationSec: 8,
      outputPath
    })
  });
  if (!r.ok) throw new Error(`Slate gen failed: ${r.status} ${await r.text()}`);

  // download slate back to buffer for uniform handling
  const url = await storage.bucket(process.env.BUCKET!).file(outputPath.replace(`gs://${process.env.BUCKET}/`, "")).getSignedUrl({
    version: "v4", action: "read", expires: Date.now() + 5 * 60 * 1000
  });
  const bin = await (await fetch(url[0])).arrayBuffer();
  return Buffer.from(bin);
}

/** ---------- STITCH via Cloud Run FFmpeg ---------- */
async function stitchClips(clipPaths: string[], outputPath: string, opts: any) {
  const res = await fetch(FFMPEG_RUN_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ clipPaths, outputPath, options: opts }),
  });
  if (!res.ok) throw new Error(`FFmpeg stitch failed: ${res.status} ${await res.text()}`);
}

/** ---------- Storage helpers ---------- */
async function saveJson(path: string, data: any) {
  const file = storage.bucket(BUCKET).file(path);
  await file.save(Buffer.from(JSON.stringify(data, null, 2)), { contentType: "application/json" });
}

async function uploadBuffer(path: string, buf: Buffer, contentType: string) {
  const file = storage.bucket(BUCKET).file(path);
  await file.save(buf, { contentType });
}
