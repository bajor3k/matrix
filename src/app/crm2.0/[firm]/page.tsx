"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { firmDetails } from "@/data/firms";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ---- DUMMY METRICS DATA ----

// One generic dummy metrics template used for all firms.
// You can customize these numbers later if you want firm-specific behavior.
const DEFAULT_METRICS = {
  firm: {
    "7D": {
      label: "Last 7 Days",
      totalTickets: 18,
      totalCalls: 7,
      prevTickets: 14,
      prevCalls: 5,
      series: [
        { label: "D1", tickets: 2, calls: 1 },
        { label: "D2", tickets: 3, calls: 1 },
        { label: "D3", tickets: 4, calls: 2 },
        { label: "D4", tickets: 3, calls: 1 },
        { label: "D5", tickets: 2, calls: 1 },
        { label: "D6", tickets: 2, calls: 0 },
        { label: "D7", tickets: 2, calls: 1 },
      ],
    },
    "30D": {
      label: "Last 30 Days",
      totalTickets: 60,
      totalCalls: 24,
      prevTickets: 48,
      prevCalls: 20,
      series: [
        { label: "W1", tickets: 12, calls: 4 },
        { label: "W2", tickets: 16, calls: 6 },
        { label: "W3", tickets: 14, calls: 5 },
        { label: "W4", tickets: 18, calls: 9 },
      ],
    },
    "90D": {
      label: "Last 90 Days",
      totalTickets: 170,
      totalCalls: 70,
      prevTickets: 150,
      prevCalls: 60,
      series: [
        { label: "M1", tickets: 55, calls: 22 },
        { label: "M2", tickets: 60, calls: 23 },
        { label: "M3", tickets: 55, calls: 25 },
      ],
    },
    YTD: {
      label: "Year to Date",
      totalTickets: 420,
      totalCalls: 180,
      prevTickets: 380,
      prevCalls: 160,
      series: [
        { label: "Q1", tickets: 120, calls: 50 },
        { label: "Q2", tickets: 140, calls: 60 },
        { label: "Q3", tickets: 160, calls: 70 },
      ],
    },
  },

  // Advisor + CA metrics – keyed by display name.
  // Every person gets the same pattern for now (dummy).
  individuals: (names: string[]) => {
    const base = {
      "7D": {
        totalTickets: 6,
        totalCalls: 3,
        series: [
          { label: "D1", tickets: 1, calls: 0 },
          { label: "D2", tickets: 1, calls: 1 },
          { label: "D3", tickets: 1, calls: 0 },
          { label: "D4", tickets: 1, calls: 1 },
          { label: "D5", tickets: 1, calls: 0 },
          { label: "D6", tickets: 1, calls: 1 },
          { label: "D7", tickets: 0, calls: 0 },
        ],
      },
      "30D": {
        totalTickets: 20,
        totalCalls: 8,
        series: [
          { label: "W1", tickets: 5, calls: 2 },
          { label: "W2", tickets: 4, calls: 2 },
          { label: "W3", tickets: 5, calls: 2 },
          { label: "W4", tickets: 6, calls: 2 },
        ],
      },
      "90D": {
        totalTickets: 55,
        totalCalls: 22,
        series: [
          { label: "M1", tickets: 18, calls: 7 },
          { label: "M2", tickets: 20, calls: 8 },
          { label: "M3", tickets: 17, calls: 7 },
        ],
      },
      YTD: {
        totalTickets: 130,
        totalCalls: 55,
        series: [
          { label: "Q1", tickets: 40, calls: 16 },
          { label: "Q2", tickets: 45, calls: 18 },
          { label: "Q3", tickets: 45, calls: 21 },
        ],
      },
    };

    const map: Record<string, typeof base> = {};
    names.forEach((n, idx) => {
      // Slightly change totals per person so they don't all look identical
      const bump = idx * 2;
      map[n] = {
        "7D": {
          ...base["7D"],
          totalTickets: base["7D"].totalTickets + bump,
          totalCalls: base["7D"].totalCalls + Math.floor(bump / 2),
        },
        "30D": {
          ...base["30D"],
          totalTickets: base["30D"].totalTickets + bump * 2,
          totalCalls: base["30D"].totalCalls + bump,
        },
        "90D": {
          ...base["90D"],
          totalTickets: base["90D"].totalTickets + bump * 3,
          totalCalls: base["90D"].totalCalls + bump,
        },
        YTD: {
          ...base["YTD"],
          totalTickets: base["YTD"].totalTickets + bump * 4,
          totalCalls: base["YTD"].totalCalls + bump * 2,
        },
      };
    });
    return map;
  },
};

// Neon-ish colors for Recharts lines
const ticketColor = "#facc15"; // yellow
const callColor = "#38bdf8"; // blue

// Simple % change helper
function formatDelta(current: number, prev: number | undefined) {
  if (!prev || prev === 0) return { pct: 0, sign: "flat" as const };
  const pct = ((current - prev) / prev) * 100;
  if (pct > 0) return { pct, sign: "up" as const };
  if (pct < 0) return { pct, sign: "down" as const };
  return { pct, sign: "flat" as const };
}

function randomIP() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return (
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)]
  );
}

function randomMaster() {
  const n = () => Math.floor(1000 + Math.random() * 9000);
  return `${n()}-${n()}`;
}

function randomG() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `G${num}`;
}

export default function FirmProfile() {
  const { firm } = useParams();
  const decoded = decodeURIComponent(firm as string);
  const data = firmDetails[decoded];

  const [selectedRange, setSelectedRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D");

  if (!data) {
    return (
      <div className="text-white p-10">
        <h1 className="text-3xl font-bold mb-4">Firm Not Found</h1>
        <p className="text-gray-400">No dummy data exists for this firm yet.</p>
      </div>
    );
  }

  // Build list of all individuals (advisors + team members)
  const advisorNames = (data.advisors || []).map((a: any) => a.name);
  const associateNames = (data.associates || []).map((a: any) => a.name);
  const individualNames = [...advisorNames, ...associateNames];

  const firmMetrics = DEFAULT_METRICS.firm;
  const individualMetrics = DEFAULT_METRICS.individuals(individualNames);

  const rangeData = firmMetrics[selectedRange];
  const ticketDelta = formatDelta(rangeData.totalTickets, rangeData.prevTickets);
  const callDelta = formatDelta(rangeData.totalCalls, rangeData.prevCalls);

  const rangeButtons: { key: "7D" | "30D" | "90D" | "YTD"; label: string }[] = [
    { key: "7D", label: "7D" },
    { key: "30D", label: "30D" },
    { key: "90D", label: "90D" },
    { key: "YTD", label: "YTD" },
  ];

  return (
    <div className="text-white p-10 space-y-6">
      <h1 className="text-4xl font-bold mb-4">{decoded}</h1>

      {/* Firm */}
      <h2 className="text-xl font-semibold mb-2">Firm</h2>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 mt-1">
        <div className="grid grid-cols-5 font-semibold text-gray-300 pb-3 border-b border-white/10">
          <div>CRD</div>
          <div>Phone</div>
          <div>Address</div>
          <div>Logo</div>
          <div>Email</div>
        </div>
        <div className="grid grid-cols-5 py-3">
          <div>{data.firmInfo.crd}</div>
          <div>{data.firmInfo.phone}</div>
          <div className="pr-4">{data.firmInfo.address}</div>
          <div>Download</div>
          <div>{data.firmInfo.email}</div>
        </div>
      </div>

      {/* ADVISORS */}
      <h2 className="text-xl font-semibold mt-10 mb-2">Advisors</h2>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 mt-1">

        {/* Table Header */}
        <div className="grid grid-cols-7 font-semibold text-gray-300 pb-3 border-b border-white/10">
          <div>Name</div>
          <div>Title</div>
          <div>PIN</div>
          <div>CRD</div>
          <div>Email</div>
          <div className="text-right">Tickets</div>
          <div className="text-right">Calls</div>
        </div>

        {/* Rows */}
        {data.advisors.map((a: any, i: number) => (
          <div key={i} className="grid grid-cols-7 py-3 border-b border-white/5">
            <div className="font-semibold">{a.name}</div>
            <div>{a.title || "Financial Advisor"}</div>
            <div>{a.pin || "0000"}</div>
            <div>{a.crd || "0000000"}</div>
            <div>{a.email}</div>

            {/* Dummy ticket + call values */}
            <div className="text-right font-semibold">{Math.floor(Math.random() * 20) + 1}</div>
            <div className="text-right font-semibold">{Math.floor(Math.random() * 10) + 1}</div>
          </div>
        ))}

      </div>

      {/* TEAM MEMBERS */}
      <h2 className="text-xl font-semibold mt-10 mb-2">Team Members</h2>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 mt-1">

        {/* Table Header */}
        <div className="grid grid-cols-7 font-semibold text-gray-300 pb-3 border-b border-white/10">
          <div>Name</div>
          <div>Title</div>
          <div>PIN</div>
          <div>CRD</div>
          <div>Email</div>
          <div className="text-right">Tickets</div>
          <div className="text-right">Calls</div>
        </div>

        {/* Rows */}
        {data.associates.map((ca: any, i: number) => (
          <div key={i} className="grid grid-cols-7 py-3 border-b border-white/5">
            <div className="font-semibold">{ca.name}</div>
            <div>{ca.role || "Client Associate"}</div>
            <div>{ca.pin}</div>

            {/* Associates may not have CRD numbers — so placeholder */}
            <div>{ca.crd || "—"}</div>

            <div>{ca.email}</div>

            {/* Dummy ticket + call values */}
            <div className="text-right font-semibold">{Math.floor(Math.random() * 15) + 1}</div>
            <div className="text-right font-semibold">{Math.floor(Math.random() * 8) + 1}</div>
          </div>
        ))}

      </div>

      {/* CUSTODIAN IDENTIFIERS */}
      <h2 className="text-xl font-semibold mt-10 mb-2">Custodian Identifiers</h2>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10">

        {/* Table Header */}
        <div className="grid grid-cols-4 font-semibold text-gray-300 pb-3 border-b border-white/10">
          <div>Custodian</div>
          <div>Identifier Type</div>
          <div>Format</div>
          <div className="text-right">Value</div>
        </div>

        {/* Rows */}
        {[
          {
            custodian: "Pershing",
            type: "IP Code",
            format: "ABC",
            value: randomIP(),
          },
          {
            custodian: "Schwab",
            type: "Master Number",
            format: "1234-5678",
            value: randomMaster(),
          },
          {
            custodian: "Fidelity",
            type: "G Number",
            format: "G123456",
            value: randomG(),
          },
          {
            custodian: "PAS",
            type: "IP Code",
            format: "ABC",
            value: randomIP(),
          },
          {
            custodian: "Goldman",
            type: "IP Code",
            format: "ABC",
            value: randomIP(),
          },
        ].map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-4 py-3 border-b border-white/5 last:border-0"
          >
            <div>{row.custodian}</div>
            <div>{row.type}</div>
            <div>{row.format}</div>
            <div className="text-right font-semibold">{row.value}</div>
          </div>
        ))}

      </div>

      {/* METRICS SECTION */}
      <section className="mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tickets & Calls Metrics</h2>
          <div className="flex gap-2">
            {rangeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setSelectedRange(btn.key)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedRange === btn.key
                    ? "bg-white text-black border-white"
                    : "bg-black/40 border-white/20 text-gray-300 hover:bg-white/10"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Firm-level KPIs + Chart */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-6">
          <p className="text-gray-400 mb-4">
            {rangeData.label} &bull; Firm-wide tickets and calls for this partner.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Tickets KPI */}
            <div className="bg-black/40 rounded-xl border border-white/10 p-4">
              <p className="text-sm text-gray-400 mb-1">Tickets ({rangeData.label})</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {rangeData.totalTickets}
                </span>
                <DeltaPill type={ticketDelta.sign} value={ticketDelta.pct} />
              </div>
            </div>

            {/* Calls KPI */}
            <div className="bg-black/40 rounded-xl border border-white/10 p-4">
              <p className="text-sm text-gray-400 mb-1">Calls ({rangeData.label})</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {rangeData.totalCalls}
                </span>
                <DeltaPill type={callDelta.sign} value={callDelta.pct} />
              </div>
            </div>
          </div>

          {/* Firm Trend Chart */}
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rangeData.series}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke={ticketColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke={callColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INDIVIDUAL BREAKDOWN */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">By Individual</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {individualNames.map((name) => {
              const metric = individualMetrics[name][selectedRange];
              return (
                <div
                  key={name}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs text-gray-400">
                        Tickets: {metric.totalTickets} &nbsp;&bull;&nbsp; Calls:{" "}
                        {metric.totalCalls}
                      </p>
                    </div>
                  </div>

                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.series}>
                        <Line
                          type="monotone"
                          dataKey="tickets"
                          stroke={ticketColor}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke={callColor}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// Small pill component for % change
function DeltaPill({
  type,
  value,
}: {
  type: "up" | "down" | "flat";
  value: number;
}) {
  const rounded = Math.abs(value).toFixed(1);
  if (type === "flat") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-300 border border-white/10">
        0.0%
      </span>
    );
  }
  const isUp = type === "up";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        isUp
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
          : "bg-rose-500/10 text-rose-300 border-rose-500/40"
      }`}
    >
      {isUp ? "▲" : "▼"} {rounded}%
    </span>
  );
}
