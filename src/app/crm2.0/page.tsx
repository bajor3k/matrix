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
    g_numbers?: string[];
    ip_codes?: string[];
    masters?: string[];
    branch?: string;
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
    const unsub = onSnapshot(collection(db, "households"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Household));
      console.log("Loaded households:", docs.length);
      setHouseholds(docs);
    });
    return () => unsub();
  }, []);

  const safeIncludes = (arr: any[] | undefined, term: string) => {
    if (!arr || !Array.isArray(arr)) return false;
    return arr.some((v) =>
      String(v).toLowerCase().includes(term.toLowerCase())
    );
  };

  const filtered = households.filter((h) => {
    const matchesSearch =
      search.trim() === "" ||
      safeIncludes(h.searchable, search) ||
      safeIncludes([h.advisor?.name], search);

    const matchesTags =
      activeTags.length === 0 ||
      activeTags.every((tag) => h.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });
  
  const tagList = [
    "advisors",
    "client associates",
    "custodians",
    "solo",
    "g#",
    "CRD",
  ];
  
  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="text-white p-6 md:p-10">

      <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10">CRM 2.0</h1>

      {/* SEARCH */}
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


      {/* RESULTS */}
      <div className="max-w-4xl mx-auto mt-10 space-y-10">
        {filtered.map((h) => (
          <div key={h.id} className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold">{h.advisor?.name}</h2>
            <p className="text-gray-400">CRD: {h.advisor?.crd_personal}</p>
            <p className="text-gray-400">Firm CRD: {h.advisor?.crd_firm}</p>
          </div>
        ))}
      </div>

    </div>
  );
}