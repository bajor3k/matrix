
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
import { cn } from "@/lib/utils";

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

const tagColors: Record<string, string> = {
  Pershing: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  Schwab: "bg-green-600/20 text-green-300 border-green-500/30",
  Fidelity: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  Goldman: "bg-red-600/20 text-red-300 border-red-500/30",
  PAS: "bg-purple-600/20 text-purple-300 border-purple-500/30",
};

export default function FirmProfile() {
  const { firm } = useParams();
  const decoded = decodeURIComponent(firm as string);
  const data = firmDetails[decoded as keyof typeof firmDetails];

  const [selectedRange, setSelectedRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D");

  if (!data) {
    return (
      <div className="text-foreground p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-4">Firm Not Found</h1>
        <p className="text-muted-foreground">No dummy data exists for this firm yet.</p>
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
    <div className="text-foreground p-6 md:p-10 space-y-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">{decoded}</h1>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.tags.map((tag: string) => (
              <span
                key={tag}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  tagColors[tag] || 'bg-muted border-border'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      

      {/* Firm */}
      <div className="bg-card p-6 rounded-2xl border border-border mt-1">
        <div className="grid grid-cols-5 font-semibold text-muted-foreground pb-3 border-b border-border">
          <div>CRD</div>
          <div>Phone</div>
          <div>Address</div>
          <div>Email</div>
          <div>Logo</div>
        </div>
        <div className="grid grid-cols-5 py-3">
          <div>{data.firmInfo.crd}</div>
          <div>{data.firmInfo.phone}</div>
          <div className="pr-4">{data.firmInfo.address}</div>
          <div>{data.firmInfo.email}</div>
          <div></div>
        </div>
      </div>

      {/* Combined Team Card */}
      {(data.advisors?.length > 0 || data.associates?.length > 0) && (
        <div className="bg-card p-6 rounded-2xl border border-border mt-1">
          <div className="grid grid-cols-7 font-semibold text-muted-foreground pb-3 border-b border-border">
            <div>Name</div>
            <div>Title</div>
            <div>PIN</div>
            <div>CRD</div>
            <div>Email</div>
            <div className="text-right">Tickets</div>
            <div className="text-right">Calls</div>
          </div>

          {/* Advisor Rows */}
          {data.advisors.map((a: any, i: number) => (
            <div key={`adv-${i}`} className="grid grid-cols-7 py-3 border-b border-border/70 items-center">
              <div className="font-semibold">{a.name}</div>
              <div>{a.title || "Financial Advisor"}</div>
              <div>{a.pin || "0000"}</div>
              <div>{a.crd || "0000000"}</div>
              <div>{a.email}</div>
              <div className="text-right font-semibold">{Math.floor(Math.random() * 20) + 1}</div>
              <div className="text-right font-semibold">{Math.floor(Math.random() * 10) + 1}</div>
            </div>
          ))}

          {/* Associate Rows */}
          {data.associates.map((ca: any, i: number) => (
            <div key={`assoc-${i}`} className="grid grid-cols-7 py-3 border-b border-border/70 last:border-0 items-center">
              <div className="font-semibold">{ca.name}</div>
              <div>{ca.role || "Client Associate"}</div>
              <div>{ca.pin}</div>
              <div>{ca.crd || "—"}</div>
              <div>{ca.email}</div>
              <div className="text-right font-semibold">{Math.floor(Math.random() * 15) + 1}</div>
              <div className="text-right font-semibold">{Math.floor(Math.random() * 8) + 1}</div>
            </div>
          ))}
        </div>
      )}

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
      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
        0.0%
      </span>
    );
  }
  const isUp = type === "up";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        isUp
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40"
      }`}
    >
      {isUp ? "▲" : "▼"} {rounded}%
    </span>
  );
}
