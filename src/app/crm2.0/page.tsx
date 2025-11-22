// src/app/crm2.0/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

interface ClientAssociate {
    name: string;
    email: string;
    phone: string;
}

interface Custodian {
    name: string;
    g_numbers: string[];
    ip_codes: string[];
    masters: string[];
    branch: string;
}

interface Advisor {
    name: string;
    email: string;
    phone: string;
    crd_personal: string;
    crd_firm: string;
    address: string;
}

interface Household {
    id: string;
    advisor: Advisor;
    client_associates: ClientAssociate[];
    custodians: Custodian[];
    tags: string[];
    searchable: string[];
}


export default function CRM2() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "households"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Household));
      setHouseholds(data);
    });
    return () => unsub();
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const filtered = households.filter((h) => {
    if (!h.searchable || !h.tags) return false;

    const matchesSearch =
      search.trim() === "" ||
      h.searchable.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );

    const matchesTags =
      activeTags.length === 0 ||
      activeTags.every((tag) => h.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const tagList = [
    "advisors",
    "client associates",
    "custodians",
    "solo",
    "g#",
    "crd",
  ];

  return (
    <div className="text-white p-6 md:p-10">

      <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10">CRM 2.0</h1>

      {/* Search */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 focus:border-white/20 outline-none text-lg"
        />
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {tagList.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-2 rounded-full text-sm transition capitalize 
              ${activeTags.includes(tag)
                ? "bg-white text-black font-semibold"
                : "bg-black/40 border border-white/10 hover:bg-white/20"
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto">
        {search.trim().length > 0 && filtered.map((h) => (
            <div key={h.id} className="space-y-8 mb-16">

            {/* Advisor Card */}
            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{h.advisor.name}</h2>
                    <p className="text-gray-400 text-sm">CRD: {h.advisor.crd_personal}</p>
                    <p className="text-gray-400 text-sm">Firm CRD: {h.advisor.crd_firm}</p>
                </div>

                <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-sm whitespace-nowrap">
                    View Full Profile
                </button>
                </div>

                {/* Custodian + Numbers */}
                <div className="flex flex-wrap gap-3 mt-4">
                {h.custodians?.map((c, i) => (
                    <div key={i} className="flex items-center flex-wrap gap-2 px-4 py-2 bg-black/50 rounded-full border border-white/10 text-sm">
                    <span className="font-semibold">{c.name}</span>

                    {c.g_numbers?.map((g, j) => (
                        <span key={j} className="px-2 py-0.5 bg-black/30 rounded-md text-xs border border-white/10">{g}</span>
                    ))}

                    {c.ip_codes?.map((ip, j) => (
                        <span key={j} className="px-2 py-0.5 bg-black/30 rounded-md text-xs border border-white/10">{ip}</span>
                    ))}

                    {c.masters?.map((m, j) => (
                        <span key={j} className="px-2 py-0.5 bg-black/30 rounded-md text-xs border border-white/10">{m}</span>
                    ))}

                    {c.branch && (
                        <span className="px-2 py-0.5 bg-black/30 rounded-md text-xs border border-white/10">
                        {c.branch}
                        </span>
                    )}
                    </div>
                ))}
                </div>

                <div className="mt-4 text-gray-300 text-sm">
                <p>{h.advisor.email}</p>
                <p>{h.advisor.address}</p>
                </div>
            </div>

            {/* Team Members */}
            {h.client_associates?.length > 0 && (
                <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-semibold mb-4">Team Members</h3>

                    <div className="space-y-4">
                        {h.client_associates.map((ca, index) => (
                        <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                            <p className="font-semibold">{ca.name}</p>
                            <p className="text-gray-400 text-sm">Client Associate</p>
                            </div>
                            <div className="text-left sm:text-right text-sm">
                            <p className="text-gray-300">{ca.email}</p>
                            <p className="text-gray-300">{ca.phone}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        ))}
        </div>
    </div>
  );
}