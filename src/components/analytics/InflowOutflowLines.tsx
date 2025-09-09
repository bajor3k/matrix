
"use client";

import * as React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// ---------- Types ----------
type FlowRow = { date: string; account: string; inflow: number; outflow: number };
type Dot = { cx: number; cy: number; payload: any; value: number };

// ---------- Utils ----------
const fmt$ = (n: number, ccy = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n);

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const largestBy = (rows: FlowRow[], key: "inflow" | "outflow") => {
  const hits = rows.filter(r => (r[key] || 0) > 0);
  if (!hits.length) return { account: "N/A", amount: 0 };
  const top = hits.reduce((m, r) => (r[key] > (m[key] || 0) ? r : m));
  return { account: top.account, amount: top[key] };
};

// ---------- Chart ----------
export function InflowOutflowLines({
  rows,
  title = "Inflow vs. Outflow",
  currency = "USD",
}: {
  rows: FlowRow[];
  title?: string;
  currency?: string;
}) {
  // Build daily aggregates for chart (sum by date)
  const data = React.useMemo(() => {
    const byDate = new Map<string, { date: string; inflow: number; outflow: number }>();
    for (const r of rows) {
      const d = r.date.slice(0, 10);
      if (!byDate.has(d)) byDate.set(d, { date: d, inflow: 0, outflow: 0 });
      const v = byDate.get(d)!;
      v.inflow += r.inflow || 0;
      v.outflow += r.outflow || 0;
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  // Totals for the window
  const totals = React.useMemo(() => {
    const inflow = sum(data.map(d => d.inflow));
    const outflow = sum(data.map(d => d.outflow));
    return { inflow, outflow, net: inflow - outflow };
  }, [data]);

  // Modal state (largest account for side)
  const [modal, setModal] = React.useState<null | { side: "in" | "out"; account: string; amount: number }>(null);

  // Legend isolate behavior
  const [show, setShow] = React.useState<{ in: boolean; out: boolean }>({ in: true, out: true });

  const onLegendClick = (o: any) => {
    if (o?.value === "Inflows") {
      setShow({ in: true, out: false });
      const top = largestBy(rows, "inflow");
      setModal({ side: "in", account: top.account, amount: top.amount });
    } else if (o?.value === "Outflows") {
      setShow({ in: false, out: true });
      const top = largestBy(rows, "outflow");
      setModal({ side: "out", account: top.account, amount: top.amount });
    }
  };

  // Custom last-dot badge (only on last point)
  const lastIdx = data.length - 1;
  const BadgeDot = ({ cx, cy, payload, value }: Dot) => {
    const isLast = payload && payload.index === lastIdx;
    if (!isLast) return null;
    return (
      <>
        <circle cx={cx} cy={cy} r={8} fill="var(--badge-fill, #c9fff7)" opacity="0.25" />
        <circle cx={cx} cy={cy} r={5} fill="var(--badge-stroke, #a7fff1)" stroke="black" strokeOpacity="0.15" />
      </>
    );
  };

  // Tooltip
  const Tip = ({ active, payload, label }: any) =>
    active && payload?.length ? (
      <div className="rounded-md border border-white/10 bg-[#111]/90 px-3 py-2 text-xs shadow-lg">
        <div className="font-medium">{label}</div>
        {payload
          .filter((p: any) => p.value > 0)
          .map((p: any) => (
            <div key={p.dataKey} className="flex gap-2">
              <span style={{ color: p.stroke }}>{p.name}:</span>
              <span className="font-semibold">{fmt$(p.value, currency)}</span>
            </div>
          ))}
      </div>
    ) : null;

  // Enhance data with index (for badge check)
  const indexed = data.map((d, i) => ({ ...d, index: i }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs text-zinc-400">Click a legend to isolate & see top account</span>
      </div>

      <div className="h-[220px] w-full rounded-xl bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={indexed} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
            <defs>
              {/* Glow by layering strokes: thick low-opacity + thin bright */}
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<Tip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="plainline"
              wrapperStyle={{ color: "rgba(255,255,255,0.75)", fontSize: 12, cursor: "pointer" }}
              onClick={onLegendClick}
            />

            {/* INFLOWS line (teal) */}
            {show.in && (
              <>
                <Line
                  name="Inflows"
                  type="monotone"
                  dataKey="inflow"
                  stroke="#18A2B8"
                  strokeWidth={3.5}
                  dot={<BadgeDot as any />}
                  activeDot={{ r: 5 }}
                  filter="url(#glow)"
                />
                {/* soft glow underlay */}
                <Line
                  type="monotone"
                  dataKey="inflow"
                  stroke="#18A2B8"
                  strokeOpacity={0.25}
                  strokeWidth={9}
                  dot={false}
                />
              </>
            )}

            {/* OUTFLOWS line (violet) */}
            {show.out && (
              <>
                <Line
                  name="Outflows"
                  type="monotone"
                  dataKey="outflow"
                  stroke="#7C3AED"
                  strokeWidth={3.5}
                  dot={<BadgeDot as any />}
                  activeDot={{ r: 5 }}
                  filter="url(#glow)"
                />
                {/* soft glow underlay */}
                <Line
                  type="monotone"
                  dataKey="outflow"
                  stroke="#7C3AED"
                  strokeOpacity={0.25}
                  strokeWidth={9}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Totals */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-400">Total Inflows</div>
          <div className="text-lg font-semibold text-emerald-400">{fmt$(totals.inflow, currency)}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-400">Net Flow</div>
          <div className="text-lg font-semibold">{fmt$(totals.net, currency)}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-400">Total Outflows</div>
          <div className="text-lg font-semibold text-violet-400">{fmt$(totals.outflow, currency)}</div>
        </div>
      </div>

      {/* Modal: largest account in the period for isolated side */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md bg-[#0c0c0c] border border-white/10">
          <DialogHeader>
            <DialogTitle>
              {modal?.side === "in" ? "Largest Inflow" : "Largest Outflow"}
            </DialogTitle>
          </DialogHeader>
          {modal && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">{modal.account}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {fmt$(modal.amount, currency)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
