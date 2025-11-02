
"use client";

import { useEffect, useMemo, useState } from "react";
import { db, storage } from "@/firebase/config";
import {
  collection, onSnapshot, orderBy, query, where, limit as qLimit, Timestamp
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

type StatementType = "monthly" | "quarterly" | "annual";

type Job = {
  id: string;
  clientName: string;
  statementType: StatementType;
  period: string; // "2025-06" | "2025-Q2" | "2025"
  status: "queued" | "parsing" | "kpis" | "scripting" | "rendering" | "complete" | "failed";
  filePath: string;          // statements/.../original.pdf
  outputVideoPath?: string | null; // videos/.../final.mp4
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function pillClass(status: Job["status"]) {
  const base = "px-2 py-0.5 rounded-full text-xs";
  const map: Record<Job["status"], string> = {
    queued:     `${base} bg-white/10 text-white/80`,
    parsing:    `${base} bg-white/10 text-white/80`,
    kpis:       `${base} bg-white/10 text-white/80`,
    scripting:  `${base} bg-white/10 text-white/80`,
    rendering:  `${base} bg-white/10 text-white/80`,
    complete:   `${base} bg-green-500/20 text-green-300`,
    failed:     `${base} bg-red-500/20 text-red-300`,
  };
  return map[status] ?? `${base} bg-white/10 text-white/80`;
}

async function gcsToUrl(path?: string | null) {
  if (!path) return null;
  try {
    const url = await getDownloadURL(ref(storage, path));
    return url;
  } catch {
    return null;
  }
}

function fmt(ts?: Timestamp) {
  if (!ts) return "—";
  const d = ts.toDate();
  return d.toLocaleString();
}

export default function JobsTable({ fixedType }: { fixedType: StatementType }) {
  const [rows, setRows] = useState<Job[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, { pdf?: string|null; mp4?: string|null }>>({});

  useEffect(() => {
    const q = query(
      collection(db, "renderJobs"),
      where("statementType", "==", fixedType),
      orderBy("createdAt", "desc"),
      qLimit(50)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const next: Job[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setRows(next);

      // prefetch URLs for visible rows
      const map: Record<string, { pdf?: string|null; mp4?: string|null }> = {};
      await Promise.all(next.map(async (j) => {
        const [pdf, mp4] = await Promise.all([
          gcsToUrl(j.filePath),
          gcsToUrl(j.outputVideoPath || undefined),
        ]);
        map[j.id] = { pdf, mp4 };
      }));
      setFileUrls(map);
    });
    return () => unsub();
  }, [fixedType]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-base font-semibold">Recent Jobs</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr className="[&>th]:py-3 [&>th]:px-6 border-b border-white/10">
              <th>Client</th>
              <th>Period</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-white/50">
                  No jobs yet. Upload a statement to kick things off.
                </td>
              </tr>
            )}
            {rows.map((j) => (
              <tr key={j.id} className="[&>td]:py-3 [&>td]:px-6 border-t border-white/5">
                <td className="whitespace-nowrap">{j.clientName || "—"}</td>
                <td className="whitespace-nowrap">{j.period || "—"}</td>
                <td><span className={pillClass(j.status)}>{j.status}</span></td>
                <td className="whitespace-nowrap">{fmt(j.createdAt)}</td>
                <td className="whitespace-nowrap">{fmt(j.updatedAt)}</td>
                <td className="text-right">
                  <div className="inline-flex gap-2">
                    {fileUrls[j.id]?.mp4 ? (
                      <a
                        href={fileUrls[j.id]!.mp4!}
                        target="_blank"
                        className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        View Video
                      </a>
                    ) : (
                      <span className="px-3 py-1 rounded-lg border border-white/10 text-white/40">View Video</span>
                    )}
                    {fileUrls[j.id]?.pdf ? (
                      <a
                        href={fileUrls[j.id]!.pdf!}
                        target="_blank"
                        className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        Source PDF
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
