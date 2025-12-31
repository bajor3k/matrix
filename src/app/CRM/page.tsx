
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const initialFirms = [
  {
    name: "Goliath Private Wealth",
    phone: "555-901-2020",
    email: "info@goliathpw.com",
    tags: ["Pershing", "PAS"],
    category: "Firm",
  },
  {
    name: "Beacon Financial Group",
    phone: "555-443-1122",
    email: "team@beaconfg.com",
    tags: ["Fidelity"],
    category: "Firm",
  },
  {
    name: "Summit Advisory Partners",
    phone: "555-778-9033",
    email: "contact@summitadvisors.com",
    tags: ["Schwab"],
    category: "Firm",
  },
  {
    name: "Northstar Capital Management",
    phone: "555-668-4521",
    email: "hello@northstarcm.com",
    tags: ["Goldman"],
    category: "Firm",
  },
  {
    name: "Evergreen Wealth Planning",
    phone: "555-998-1123",
    email: "support@evergreenwp.com",
    tags: ["Pershing"],
    category: "Firm",
  },
  {
    name: "Apex Strategic Advisors",
    phone: "555-491-7782",
    email: "team@apexsa.com",
    tags: ["PAS"],
    category: "Firm",
  },
  {
    name: "Horizon Private Clients",
    phone: "555-312-4477",
    email: "info@horizonpc.com",
    tags: ["Fidelity"],
    category: "Firm",
  },
  {
    name: "Titanium Wealth Group",
    phone: "555-889-0044",
    email: "service@titaniumwg.com",
    tags: ["Schwab"],
    category: "Firm",
  },
  {
    name: "Atlas Financial Network",
    phone: "555-678-9911",
    email: "office@atlasfn.com",
    tags: ["Goldman"],
    category: "Firm",
  },
  {
    name: "Blue Ridge Investment House",
    phone: "555-890-2233",
    email: "contact@blueridgeih.com",
    tags: ["Pershing"],
    category: "Firm",
  },
];

const CLIENT_NAMES = [
  "James Smith", "Maria Garcia", "Robert Johnson", "Lisa Davis",
  "Michael Brown", "Jennifer Wilson", "William Moore", "Elizabeth Taylor",
  "David Anderson", "Sarah Thomas", "Richard Jackson", "Karen White",
  "Joseph Harris", "Nancy Martin", "Thomas Thompson", "Margaret Garcia",
  "Charles Martinez", "Sandra Robinson", "Daniel Clark", "Ashley Rodriguez"
];

export default function CRM2() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [firms, setFirms] = useState(initialFirms);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };


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

  // Tag colors
  const tagColors: Record<string, string> = {
    Pershing: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    Schwab: "bg-green-600/20 text-green-400 border-green-500/30",
    Fidelity: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    Goldman: "bg-red-600/20 text-red-400 border-red-500/30",
    PAS: "bg-purple-600/20 text-purple-400 border-purple-500/30",
  };
  const availableTags = ["Pershing", "Schwab", "Fidelity", "Goldman", "PAS"];

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
        ...updated[editIndex],
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
          category: 'Firm'
        },
      ]);
    }

    setModalOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
        const newTags = prev.tags.includes(tag)
            ? prev.tags.filter(t => t !== tag)
            : [...prev.tags, tag];
        return { ...prev, tags: newTags };
    });
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
    <div className="text-foreground p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        {/* Search Bar */}
        <div className="max-w-2xl relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Partner Firms"
            className="w-full p-4 rounded-2xl bg-card border border-border outline-none focus:border-ring"
          />
        </div>

        <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8 px-4 text-xs font-medium bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100">
                All
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                Firm
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                Client
            </Button>
        </div>
      </div>

      {/* Add Firm Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-accent transition"
        >
          + Add Firm
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-4 px-6 text-muted-foreground">Name</th>
              <th className="py-4 px-6 text-muted-foreground">Phone</th>
              <th className="py-4 px-6 text-muted-foreground">Email</th>
              <th className="py-4 px-6 text-muted-foreground">Custodian</th>
              <th className="py-4 px-6 text-muted-foreground"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((firm, index) => {
              const isExpanded = expandedRows.has(index);

              // Generate 2 clients for this firm
              const firmClients = [0, 1].map((offset) => {
                const nameIndex = (index * 2 + offset) % CLIENT_NAMES.length;
                const fullName = CLIENT_NAMES[nameIndex];
                const [firstName, lastName] = fullName.split(" ");
                
                // Email: lastname@firmdomain
                const domain = firm.email.split("@")[1] || "gmail.com";
                const clientEmail = `${lastName.toLowerCase()}@${domain}`;
                
                // Login ID: XYZ + First Initial + First 3 of Last Name
                const loginId = `XYZ${firstName[0]}${lastName.slice(0, 3)}`;
                
                // PIN: Random 4 digits
                const pin = Math.floor(1000 + Math.random() * 9000);

                // Phone: Random-ish variation of firm phone
                const clientPhone = firm.phone.slice(0, -4) + Math.floor(1000 + Math.random() * 9000);

                return { name: fullName, email: clientEmail, loginId, pin, phone: clientPhone };
              });

              return (
                <>
                  {/* FIRM ROW */}
                  <tr key={`firm-${index}`} className="border-t border-border hover:bg-accent/50 transition">
                    <td className="py-4 px-6 font-medium">
                      <Link href={`/CRM/${encodeURIComponent(firm.name)}`} className="hover:underline">
                        {firm.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{firm.phone}</td>
                    <td className="py-4 px-6 text-muted-foreground">{firm.email}</td>
                    
                    {/* Tags */}
                    <td className="py-4 px-6">
                      <div className="flex gap-2 flex-wrap">
                        {firm.tags.map((tag, i) => (
                          <span
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTagFilter(tag);
                            }}
                            className={cn(
                              `px-3 py-1 rounded-full text-sm border cursor-pointer transition`,
                              tagColors[tag] || "bg-muted border-border",
                              selectedTag === tag ? "ring-2 ring-ring scale-105" : ""
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Chevron (Toggle) */}
                    <td className="py-4 px-6 text-right cursor-pointer" onClick={() => toggleRow(index)}>
                      <ChevronDown 
                        className={cn(
                          "ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </td>
                  </tr>

                  {/* EXPANDED CLIENT ROWS */}
                  {isExpanded && firmClients.map((client, i) => (
                    <tr key={`client-${index}-${i}`} className="bg-muted/30 border-t border-border/40 hover:bg-muted/50">
                      {/* Name (Indented, No Arrow) */}
                      <td className="py-3 px-6 pl-12 font-medium text-sm text-foreground/80">
                        {client.name}
                      </td>
                      {/* Phone */}
                      <td className="py-3 px-6 text-sm text-muted-foreground">
                        {client.phone}
                      </td>
                      {/* Email */}
                      <td className="py-3 px-6 text-sm text-muted-foreground">
                        {client.email}
                      </td>
                      {/* Login ID */}
                      <td className="py-3 px-6 text-sm text-muted-foreground">
                        ID: {client.loginId}
                      </td>
                      {/* PIN */}
                      <td className="py-3 px-6 text-right text-sm text-muted-foreground">
                        PIN: {client.pin}
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
            
            {filtered.length === 0 && (
              <tr className="border-t border-border">
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
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
          <div className="bg-popover p-6 rounded-2xl border border-border w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-popover-foreground">
              {editIndex !== null ? "Edit Firm" : "Add Firm"}
            </h2>

            <div className="flex flex-col gap-4">
              <input
                placeholder="Firm Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="p-3 bg-background border border-input rounded-xl"
              />

              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="p-3 bg-background border border-input rounded-xl"
              />

              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="p-3 bg-background border border-input rounded-xl"
              />

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Custodians</label>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                                formData.tags.includes(tag) 
                                    ? `${tagColors[tag]} ring-2 ring-ring` 
                                    : "bg-muted/50 border-border hover:bg-muted"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground border border-border"
              >
                Cancel
              </button>

              <button
                onClick={saveFirm}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
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
