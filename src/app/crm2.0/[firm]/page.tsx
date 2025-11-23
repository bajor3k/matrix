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
      <div className="text-white p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-4">Firm Not Found</h1>
        <p className="text-gray-400">No dummy data exists for this firm yet.</p>
      </div>
    );
  }

  return (
    <div className="text-white p-6 md:p-10 space-y-10">
      {/* Firm Name */}
      <h1 className="text-4xl font-bold">{decoded}</h1>

      {/* FIRM INFO CARD */}
      {data.firmInfo && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-3">Firm</h2>

          <p className="text-gray-300">
            <span className="font-semibold text-white">Firm CRD:</span>{" "}
            {data.firmInfo.crd}
          </p>

          <p className="text-gray-300 mt-1">
            <span className="font-semibold text-white">Phone:</span>{" "}
            {data.firmInfo.phone}
          </p>

          <p className="text-gray-300 mt-1">
            <span className="font-semibold text-white">Email:</span>{" "}
            {data.firmInfo.email}
          </p>

          <p className="text-gray-300 mt-1">
            <span className="font-semibold text-white">Address:</span>{" "}
            {data.firmInfo.address}
          </p>
        </div>
      )}

      {/* ADVISORs CARD */}
      {data.advisors && data.advisors.length > 0 && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Advisors</h2>
          <div className="grid grid-cols-3 font-semibold text-gray-300 pb-3 border-b border-white/10">
            <div>Name</div>
            <div>CRD</div>
            <div>Email</div>
          </div>
          {data.advisors.map((advisor, i) => (
            <div
              key={i}
              className="grid grid-cols-3 py-4 border-b border-white/5 last:border-b-0 items-center"
            >
              <div className="font-semibold text-white">{advisor.name}</div>
              <div className="text-gray-300">{advisor.crd}</div>
              <div className="text-gray-300 text-sm">{advisor.email}</div>
            </div>
          ))}
        </div>
      )}


      {/* TEAM MEMBERS */}
      {data.associates.length > 0 && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Team Members</h3>

          <div className="grid grid-cols-4 font-semibold text-gray-300 pb-3 border-b border-white/10">
            <div>Name</div>
            <div>Job Title</div>
            <div>PIN</div>
            <div className="text-right">Contact</div>
          </div>

          {data.associates.map((ca, i) => (
            <div
              key={i}
              className="grid grid-cols-4 py-4 border-b border-white/5 last:border-b-0"
            >
              {/* Name */}
              <div className="font-semibold text-white">{ca.name}</div>

              {/* Job Title */}
              <div className="text-gray-300">{ca.role}</div>

              {/* PIN */}
              <div className="text-gray-300">{ca.pin}</div>

              {/* Contact */}
              <div className="text-right">
                <p>{ca.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
