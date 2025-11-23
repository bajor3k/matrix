
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
          <div className="grid grid-cols-5 font-semibold text-gray-300 pb-3 border-b border-white/10">
            <div>Firm CRD</div>
            <div>Phone</div>
            <div>Address</div>
            <div>Logo</div>
            <div className="text-right">Email</div>
          </div>
          <div
              className="grid grid-cols-5 py-4 border-b border-white/5 last:border-b-0 items-center"
            >
              <div className="text-gray-300">{data.firmInfo.crd}</div>
              <div className="text-gray-300">{data.firmInfo.phone}</div>
              <div className="text-gray-300">
                {data.firmInfo.address.split(",")[0]}
                <br />
                {data.firmInfo.address.split(",").slice(1).join(",").trim()}
              </div>
               <div>
                <a 
                  href="https://placehold.co/150x50.png?text=Logo" 
                  download="logo.png"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  Download
                </a>
              </div>
              <div className="text-gray-300 text-sm text-right">{data.firmInfo.email}</div>
            </div>
        </div>
      )}

      {/* ADVISORs CARD */}
      {data.advisors && data.advisors.length > 0 && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Advisors</h2>
          <div className="grid grid-cols-5 font-semibold text-gray-300 pb-3 border-b border-white/10">
            <div>Name</div>
            <div>Title</div>
            <div>PIN</div>
            <div>CRD</div>
            <div className="text-right">Email</div>
          </div>
          {data.advisors.map((advisor, i) => (
            <div
              key={i}
              className="grid grid-cols-5 py-4 border-b border-white/5 last:border-b-0 items-center"
            >
              <div className="font-semibold text-white">{advisor.name}</div>
              <div className="text-gray-300">{advisor.title}</div>
              <div className="text-gray-300">{advisor.pin}</div>
              <div className="text-gray-300">{advisor.crd}</div>
              <div className="text-gray-300 text-sm text-right">{advisor.email}</div>
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
            <div>Title</div>
            <div>PIN</div>
            <div className="text-right">Email</div>
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
                <p className="text-gray-300 text-sm">{ca.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
