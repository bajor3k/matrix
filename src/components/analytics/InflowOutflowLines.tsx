"use client";
import * as React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Row = { date: string; account: string; inflow: number; outflow: number };
const fmt$ = (n: number, ccy = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const largestBy = (rows: Row[], key: "inflow" | "outflow") => {
  const hits = rows.filter(r => (r[key] || 0) > 0);
  if (!hits.length) return { account: "N/A", amount: 0 };
  const top = hits.reduce((m, r) => (r[key] > (m[key] || 0) ? r : m));
  return { account: top.account, amount: top[key] };
};

export function InflowOutflowLines({
  rows,
  title = "Inflow vs. Outflow",
  currency = "USD",
}: { rows: Row[]; title?: string; currency?: string }) {

  // 1) aggregate by day for the chart
  const data = React.useMemo(() => {
    const byDate = new Map<string, { date: string; inflow: number; outflow: number }>();
    for (const r of rows) {
      const d = r.date.slice(0, 10);
      if (!byDate.has(d)) byDate.set(d, { date: d, inflow: 0, outflow: 0 });
      const v = byDate.get(d)!;
      v.inflow += +r.inflow || 0;
      v.outflow += +r.outflow || 0;
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  // 2) totals for footer
  const totals = React.useMemo(() => {
    const inflow = sum(data.map(d => d.inflow));
    const outflow = sum(data.map(d => d.outflow));
    return { inflow, outflow, net: inflow - outflow };
  }, [data]);

  // 3) legend isolate + modal
  const [modal, setModal] = React.useState<null | { side: "in" | "out"; account: string; amount: number }>(null);
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

  // 4) last-point badge
  const lastIdx = data.length - 1;
  const BadgeDot = ({ cx, cy, payload }: any) =>
    payload?.index === lastIdx ? (
      <>
        <circle cx={cx} cy={cy} r={8} fill="#c9fff7" opacity="0.25" />
        <circle cx={cx} cy={cy} r={5} fill="#a7fff1" stroke="black" strokeOpacity="0.15" />
      </>
    ) : null;

  // 5) add index for badge check
  const indexed = data.map((d, i) => ({ ...d, index: i }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs text-zinc-400">Click a legend to isolate & see top account</span>
      </div>

      {/* IMPORTANT: give the chart a fixed height */}
      <div className="h-[260px] w-full rounded-xl bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={indexed} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
                     labelStyle={{ color: "white" }} itemStyle={{ color: "white" }}/>
            <Legend verticalAlign="top" align="right" onClick={onLegendClick}
                    wrapperStyle={{ color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer" }}/>

            {show.in && (
              <>
                <Line name="Inflows" type="monotone" dataKey="inflow" stroke="#18A2B8" strokeWidth={3.5}
                      dot={<BadgeDot />} activeDot={{ r: 5 }}/>
                <Line type="monotone" dataKey="inflow" stroke="#18A2B8" strokeOpacity={0.20} strokeWidth={9} dot={false}/>
              </>
            )}
            {show.out && (
              <>
                <Line name="Outflows" type="monotone" dataKey="outflow" stroke="#7C3AED" strokeWidth={3.5}
                      dot={<BadgeDot />} activeDot={{ r: 5 }}/>
                <Line type="monotone" dataKey="outflow" stroke="#7C3AED" strokeOpacity={0.20} strokeWidth={9} dot={false}/>
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

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

      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md bg-[#0c0c0c] border border-white/10">
          <DialogHeader><DialogTitle>{modal?.side === "in" ? "Largest Inflow" : "Largest Outflow"}</DialogTitle></DialogHeader>
          {modal && (
            <div className="mt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody><TableRow><TableCell className="font-mono">{modal.account}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt$(modal.amount, currency)}</TableCell></TableRow></TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
