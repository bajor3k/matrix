"use client";

import { useState } from "react";
import Link from "next/link";

export default function CRM2() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    tags: "",
  });

  const [firms, setFirms] = useState([
    {
      name: "Goliath Private Wealth",
      phone: "555-901-2020",
      email: "info@goliathpw.com",
      tags: ["RIA", "Multi-Custodian"],
    },
    {
      name: "Beacon Financial Group",
      phone: "555-443-1122",
      email: "team@beaconfg.com",
      tags: ["Hybrid", "Boutique"],
    },
    {
      name: "Summit Advisory Partners",
      phone: "555-778-9033",
      email: "contact@summitadvisors.com",
      tags: ["RIA"],
    },
    {
      name: "Northstar Capital Management",
      phone: "555-668-4521",
      email: "hello@northstarcm.com",
      tags: ["Family Office", "VIP"],
    },
    {
      name: "Evergreen Wealth Planning",
      phone: "555-998-1123",
      email: "support@evergreenwp.com",
      tags: ["RIA", "Lead"],
    },
    {
      name: "Apex Strategic Advisors",
      phone: "555-491-7782",
      email: "team@apexsa.com",
      tags: ["Prospect"],
    },
    {
      name: "Horizon Private Clients",
      phone: "555-312-4477",
      email: "info@horizonpc.com",
      tags: ["VIP", "Boutique"],
    },
    {
      name: "Titanium Wealth Group",
      phone: "555-889-0044",
      email: "service@titaniumwg.com",
      tags: ["RIA"],
    },
    {
      name: "Atlas Financial Network",
      phone: "555-678-9911",
      email: "office@atlasfn.com",
      tags: ["Hybrid"],
    },
    {
      name: "Blue Ridge Investment House",
      phone: "555-890-2233",
      email: "contact@blueridgeih.com",
      tags: ["RIA", "Referred"],
    },
  ]);

  // 🔎 Filtering
  const filtered = firms.filter((firm) => {
    const text = search.toLowerCase();
    return (
      firm.name.toLowerCase().includes(text) ||
      firm.phone.toLowerCase().includes(text) ||
      firm.email.toLowerCase().includes(text) ||
      firm.tags.some((tag) => tag.toLowerCase().includes(text))
    );
  });

  // ➕ Open modal for adding
  const openAddModal = () => {
    setEditIndex(null);
    setFormData({ name: "", phone: "", email: "", tags: "" });
    setModalOpen(true);
  };

  // ✏ Open modal for editing
  const openEditModal = (index: number) => {
    // We need to find the original index in the `firms` array, not the `filtered` array
    const originalIndex = firms.findIndex(f => f.name === filtered[index].name);
    if (originalIndex === -1) return;

    setEditIndex(originalIndex);
    const firm = firms[originalIndex];
    setFormData({
      name: firm.name,
      phone: firm.phone,
      email: firm.email,
      tags: firm.tags.join(", "),
    });
    setModalOpen(true);
  };

  // 💾 Save new or edited firm
  const saveFirm = () => {
    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

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
                <td className="py-4 px-6">
                  <div className="flex gap-2 flex-wrap">
                    {firm.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm bg-black/50 border border-white/10"
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

              <input
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="p-3 bg-black/40 border border-white/10 rounded-xl"
              />
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
