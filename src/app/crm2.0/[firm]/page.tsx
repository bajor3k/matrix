"use client";

import { useParams } from "next/navigation";
import { firmDetails } from "@/data/firms";

export default function FirmProfile() {
  const params = useParams();
  const firm = params.firm as string;
  const decoded = decodeURIComponent(firm);

  const data = firmDetails[decoded];

  if (!data) {
    return (
      <div className="text-white p-10">
        <h1 className="text-3xl font-bold mb-4">Firm Not Found</h1>
        <p className="text-gray-400">No dummy data exists for this firm yet.</p>
      </div>
    );
  }

  return (
    <div className="text-white p-6 md:p-10 space-y-10">
      <h1 className="text-4xl font-bold">{decoded}</h1>

      {/* Advisors */}
      {data.advisors.map((advisor, i) => (
        <div
          key={i}
          className="bg-black/40 p-6 rounded-2xl border border-white/10"
        >
          <h2 className="text-2xl font-bold">{advisor.name}</h2>

          <p className="text-gray-400">CRD: {advisor.crd}</p>
          <p className="text-gray-400">Firm CRD: {advisor.firmCrd}</p>

          <div className="flex gap-3 mt-4 flex-wrap">
            {advisor.tags.map((tag, j) => (
              <span
                key={j}
                className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4">{advisor.email}</p>
        </div>
      ))}

      {/* Client Associates */}
      {data.associates.length > 0 && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Team Members</h3>

          {data.associates.map((ca, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-white/5 py-3 last:border-b-0"
            >
              <div>
                <p className="font-semibold">{ca.name}</p>
                <p className="text-gray-400 text-sm">{ca.role}</p>
              </div>
              <div className="text-right">
                <p>{ca.email}</p>
                <p>{ca.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
