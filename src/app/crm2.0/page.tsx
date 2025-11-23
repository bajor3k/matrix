"use client";

import { useState } from "react";
import Link from "next/link";

export default function CRM2() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    tags: string[];
  }>({
    name: "",
    phone: "",
    email: "",
    tags: [],
  });

  const [firms, setFirms] = useState([
    {
      name: "Goliath Private Wealth",
      phone: "555-901-2020",
      email: "info@goliathpw.com",
      tags: ["Pershing", "PAS"],
    },
    {
      name: "Beacon Financial Group",
      phone: "555-443-1122",
      email: "team@beaconfg.com",
      tags: ["Fidelity"],
    },
    {
      name: "Summit Advisory Partners",
      phone: "555-778-9033",
      email: "contact@summitadvisors.com",
      tags: ["Schwab"],
    },
    {
      name: "Northstar Capital Management",
      phone: "555-668-4521",
      email: "hello@northstarcm.com",
      tags: ["Goldman"],
    },
    {
      name: "Evergreen Wealth Planning",
      phone: "555-998-1123",
      email: "support@evergreenwp.com",
      tags: ["Pershing"],
    },
    {
      name: "Apex Strategic Advisors",
      phone: "555-491-7782",
      email: "team@apexsa.com",
      tags: ["PAS"],
    },
    {
      name: "Horizon Private Clients",
      phone: "555-312-4477",
      email: "info@horizonpc.com",
      tags: ["Fidelity"],
    },
    {
      name: "Titanium Wealth Group",
      phone: "555-889-0044",
      email: "service@titaniumwg.com",
      tags: ["Schwab"],
    },
    {
      name: "Atlas Financial Network",
      phone: "555-678-9911",
      email: "office@atlasfn.com",
      tags: ["Goldman"],
    },
    {
      name: "Blue Ridge Investment House",
      phone: "555-890-2233",
      email: "contact@blueridgeih.com",
      tags: ["Pershing"],
    },
  ]);

  // Tag colors
  const tagColors: Record<string, string> = {
    Pershing: "bg-blue-600/20 text-blue-300 border-blue-500/30",
    Schwab: "bg-green-600/20 text-green-300 border-green-500/30",
    Fidelity: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
    Goldman: "bg-red-600/20 text-red-300 border-red-500/30",
    PAS: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  };

  // TAG FILTER LOGIC
  const toggleTagFilter = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  // ➕ Open modal for adding
  const openAddModal = () => {
    setEditIndex(null);
    setFormData({ name: "", phone: "", email: "", tags: [] });
    setModalOpen(true);
  };

  // ✏ Open modal for editing
  const openEditModal = (index: number) => {
    const originalIndex = firms.findIndex(f => f.name === filtered[index].name);
    if (originalIndex === -1) return;

    setEditIndex(originalIndex);
    const firm = firms[originalIndex];
    setFormData({
      name: firm.name,
      phone: firm.phone,
      email: firm.email,
      tags: firm.tags,
    });
    setModalOpen(true);
  };

  // 💾 Save new or edited firm
  const saveFirm = () => {
    const parsedTags = formData.tags;

    if (editIndex !== null) {
      const updated = [...firms];
      updated[editIndex] = {
        ...formData,
        tags: parsedTags,
      };
      setFirms(updated);
    } else {
      setFirms([
        ...firms,
        {
          ...formData,
          tags: parsedTags,
        },
      ]);
    }

    setModalOpen(false);
  };

  // FILTERED FIRMS
  const filtered = firms.filter((firm) => {
    const text = search.toLowerCase();
    const matchesSearch =
      firm.name.toLowerCase().includes(text) ||
      firm.phone.toLowerCase().includes(text) ||
      firm.email.toLowerCase().includes(text);

    const matchesTag =
      selectedTag === null || firm.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="text-white p-6 md:p-10">
      {/* Search Bar */}
      <div className="max-w-2xl mb-8 relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Partner Firms"
          className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-white/20"
        />
      </div>

      {/* Add Firm Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
        >
          + Add Firm
        </button>
      </div>

      {/* Table */}
      <div className="bg-black/40 rounded-2xl border border-white/10 overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead className="bg-black/30">
            <tr>
              <th className="py-4 px-6 text-gray-400">Name</th>
              <th className="py-4 px-6 text-gray-400">Phone</th>
              <th className="py-4 px-6 text-gray-400">Email</th>
              <th className="py-4 px-6 text-gray-400">Tags</th>
              <th className="py-4 px-6 text-gray-400"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((firm, index) => (
              <tr
                key={index}
                className="border-t border-white/5 hover:bg-white/5 transition"
              >
                <td className="py-4 px-6 font-medium">
                  <Link href={`/crm2.0/${encodeURIComponent(firm.name)}`} className="hover:underline">
                    {firm.name}
                  </Link>
                </td>
                <td className="py-4 px-6 text-gray-300">{firm.phone}</td>
                <td className="py-4 px-6 text-gray-300">{firm.email}</td>
                {/* TAGS - CLICKABLE */}
                <td className="py-4 px-6">
                  <div className="flex gap-2 flex-wrap">
                    {firm.tags.map((tag, i) => (
                      <span
                        key={i}
                        onClick={() => toggleTagFilter(tag)}
                        className={`
                          px-3 py-1 rounded-full text-sm border cursor-pointer transition
                          ${tagColors[tag] || "bg-white/10 border-white/10"}
                          ${
                            selectedTag === tag
                              ? "ring-2 ring-white/40 scale-105"
                              : ""
                          }
                        `}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Edit Button */}
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => openEditModal(index)}
                    className="px-3 py-1 rounded-md bg-white/10 border border-white/20 hover:bg-white/20"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
             {filtered.length === 0 && (
              <tr className="border-t border-white/5">
                <td colSpan={5} className="text-center py-8 text-gray-500">
                    No matching firms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4">
              {editIndex !== null ? "Edit Firm" : "Add Firm"}
            </h2>

            <div className="flex flex-col gap-4">
              <input
                placeholder="Firm Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="p-3 bg-black/40 border border-white/10 rounded-xl"
              />

              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="p-3 bg-black/40 border border-white/10 rounded-xl"
              />

              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="p-3 bg-black/40 border border-white/10 rounded-xl"
              />

              <select
                multiple
                value={formData.tags}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  })
                }
                className="p-3 bg-black/40 border border-white/10 rounded-xl"
              >
                <option value="Pershing">Pershing</option>
                <option value="Schwab">Schwab</option>
                <option value="Fidelity">Fidelity</option>
                <option value="Goldman">Goldman</option>
                <option value="PAS">PAS</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
              >
                Cancel
              </button>

              <button
                onClick={saveFirm}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-gray-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
