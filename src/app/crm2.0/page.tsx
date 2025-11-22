"use client";

import { useState } from "react";

export default function CRM2() {
  // Dummy Partner Firms
  const firms = [
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
  ];

  const handleClick = (firm: any) => {
    console.log("Clicked firm:", firm);
    // Later: navigate to firm profile page
  };

  return (
    <div className="text-white p-6 md:p-10">
      {/* Search Bar */}
      <div className="max-w-2xl mb-8">
        <input
          placeholder="Search Partner Firms"
          className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-white/20"
        />
      </div>

      {/* Table */}
      <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/30">
            <tr>
              <th className="py-4 px-6 text-gray-400">Name</th>
              <th className="py-4 px-6 text-gray-400">Phone</th>
              <th className="py-4 px-6 text-gray-400">Email</th>
              <th className="py-4 px-6 text-gray-400">Tags</th>
            </tr>
          </thead>

          <tbody>
            {firms.map((firm, index) => (
              <tr
                key={index}
                onClick={() => handleClick(firm)}
                className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition"
              >
                <td className="py-4 px-6 font-medium">{firm.name}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
