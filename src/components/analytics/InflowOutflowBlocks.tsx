
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Types ---
type FlowDataPoint = {
  account: string;
  amount: number;
};

interface InflowOutflowBlocksProps {
  inflows: FlowDataPoint[];
  outflows: FlowDataPoint[];
  currency?: string;
  title?: string;
}

// --- Helper Functions ---
const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const findLargest = (data: FlowDataPoint[]) => {
  if (!data || data.length === 0) return { account: 'N/A', amount: 0 };
  return data.reduce((largest, current) => (current.amount > largest.amount ? current : largest), data[0]);
};


// TRUE 3D CYLINDER (SVG) — with end caps, side wall, rim + floor shadow
function CylinderSegment({
  w = 360,
  h = 64,          // cylinder height
  depth = 18,      // extrusion depth
  color = "#7CCAFF",
  colorDark = "#2A6AA1",
  muted = false,
  capLeft = true,  // show left circular end-cap
  capRight = true, // show right circular end-cap
  joinFlat = false, // if true: flatten the meeting edge (no round on that side)
  label = "",
  onClick,
}: {
  w?: number; h?: number; depth?: number;
  color?: string; colorDark?: string; muted?: boolean;
  capLeft?: boolean; capRight?: boolean; joinFlat?: boolean;
  label?: string; onClick?: () => void;
}) {
  const id = React.useMemo(() => Math.random().toString(36).slice(2, 9), []);
  const faceLight = muted ? "#5A5A5A" : color;
  const faceDark  = muted ? "#2B2B2B" : colorDark;

  const rxLeft  = capLeft  ? h / 2 : (joinFlat ? 0 : h / 2);
  const rxRight = capRight ? h / 2 : (joinFlat ? 0 : h / 2);

  // helper path for rounded rectangle (top face) so we can clip the wall under it
  const roundedPath = (width: number, height: number, rL: number, rR: number, y = 0) => {
    const rLy = Math.min(rL, height / 2), rRy = Math.min(rR, height / 2);
    const rLx = rLy, rRx = rRy;
    const top = y, bottom = height + y, left = 0, right = width;
    return `M ${left + rLx} ${top}
            H ${right - rRx}
            ${rRx ? `A ${rRx} ${rRy} 0 0 1 ${right} ${top + rRy}` : ""}
            V ${bottom - rRy}
            ${rRx ? `A ${rRx} ${rRy} 0 0 1 ${right - rRx} ${bottom}` : ""}
            H ${left + rLx}
            ${rLx ? `A ${rLx} ${rLy} 0 0 1 ${left} ${bottom - rLy}` : ""}
            V ${top + rLy}
            ${rLx ? `A ${rLx} ${rLy} 0 0 1 ${left + rLx} ${top}` : ""}
            Z`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative isolate inline-flex items-center justify-center select-none focus:outline-none"
      style={{ width: w, height: h + depth + 16 }}
      aria-label={label || "cylinder"}
      title={label || "cylinder"}
    >
      <svg width={w} height={h + depth + 16} viewBox={`0 0 ${w} ${h + depth + 16}`}>
        <defs>
          <linearGradient id={`face-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={faceLight}/>
            <stop offset="100%" stopColor={faceDark}/>
          </linearGradient>
          <linearGradient id={`wall-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={muted ? "#707070" : faceLight} stopOpacity="0.92"/>
            <stop offset="100%" stopColor={muted ? "#1a1a1a" : faceDark}   stopOpacity="0.92"/>
          </linearGradient>
          <radialGradient id={`capHi-${id}`} cx="35%" cy="35%" r="80%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.14"/>
            <stop offset="80%"  stopColor="#FFFFFF" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`capShade-${id}`} cx="65%" cy="65%" r="90%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0.18"/>
            <stop offset="85%"  stopColor="#000000" stopOpacity="0"/>
          </radialGradient>
          <clipPath id={`clipTop-${id}`}>
            <path d={roundedPath(w, h, rxLeft, rxRight)} />
          </clipPath>
        </defs>

        {/* floor shadow */}
        <ellipse cx={w/2} cy={h + depth + 10} rx={Math.max(24, w*0.45)} ry={7} fill="rgba(0,0,0,0.45)"/>

        {/* side wall (extrusion) clipped under the top face */}
        <g clipPath={`url(#clipTop-${id})`}>
          <rect x="0" y="0" width={w} height={h + depth} fill={`url(#wall-${id})`} />
        </g>

        {/* bottom rim/occlusion to give thickness */}
        <path d={roundedPath(w, h, rxLeft, rxRight, depth)} fill={`url(#face-${id})`} opacity="0.95"/>

        {/* top face */}
        <path d={roundedPath(w, h, rxLeft, rxRight)} fill={`url(#face-${id})`} />

        {/* end-cap emphasis: slight highlight + shade (sells the cylinder) */}
        {capLeft  && <ellipse cx={h/2}     cy={(h)/2} rx={h/2} ry={h/2} fill={`url(#capHi-${id})`} />}
        {capRight && <ellipse cx={w - h/2} cy={(h)/2} rx={h/2} ry={h/2} fill={`url(#capShade-${id})`} />}
      </svg>

      {label && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-white/90">
          {label}
        </span>
      )}
    </button>
  );
}


// --- Main Component ---
export const InflowOutflowBlocks: React.FC<InflowOutflowBlocksProps> = ({
  inflows,
  outflows,
  currency = 'USD',
  title = 'Inflow vs. Outflow',
}) => {
  const [info, setInfo] = React.useState<{ side: "in" | "out"; account: string; amount: number } | null>(null);
  const [selected, setSelected] = React.useState<"in" | "out" | null>(null);
  const [split, setSplit] = React.useState(false);

  const totalInflow = React.useMemo(() => inflows.reduce((sum, item) => sum + item.amount, 0), [inflows]);
  const totalOutflow = React.useMemo(() => outflows.reduce((sum, item) => sum + item.amount, 0), [outflows]);
  const netFlow = totalInflow - totalOutflow;
  const grandTotal = totalInflow + totalOutflow;

  // Ensure a minimum width for visibility even if one value is 0
  const minW = 15;
  const inW = grandTotal > 0 ? Math.max(minW, (totalInflow / grandTotal) * 400) : 200;
  const outW = grandTotal > 0 ? Math.max(minW, (totalOutflow / grandTotal) * 400) : 200;

  const maxIn = React.useMemo(() => findLargest(inflows), [inflows]);
  const maxOut = React.useMemo(() => findLargest(outflows), [outflows]);
  
  const closeInfo = () => {
    setInfo(null);
    setSelected(null);
    setSplit(false); // reconnect halves
  };
  
  return (
    <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-lg">
      <h3 className="text-base font-bold text-foreground mb-6 text-center">{title}</h3>
      
        {/* VISUAL ROW */}
        <div
        className="relative mx-auto mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-black/20 p-6 min-h-[120px]"
        >
        {/* dynamic gap: 0 when connected, 24px when split */}
        <div className="flex items-center transition-[gap] duration-200" style={{ gap: split ? 24 : 0 }}>
            {!split ? (
            <>
                {/* CONNECTED halves: flatten the meeting edges so they touch perfectly */}
                <CylinderSegment
                w={inW}
                h={64}
                depth={18}
                color="hsl(var(--chart-1))"
                colorDark="hsl(204 80% 40%)"
                label="Inflows"
                capLeft
                capRight={false}  // flat join
                joinFlat           // remove rounding at the join
                onClick={() => {
                    setSplit(true);
                    setSelected("in");
                    if (maxIn) setInfo({ side: "in", account: maxIn.account, amount: maxIn.amount });
                }}
                />
                <CylinderSegment
                w={outW}
                h={64}
                depth={18}
                color="hsl(var(--chart-5))"
                colorDark="hsl(274 80% 40%)"
                label="Outflows"
                capLeft={false}   // flat join
                capRight
                joinFlat
                onClick={() => {
                    setSplit(true);
                    setSelected("out");
                    if (maxOut) setInfo({ side: "out", account: maxOut.account, amount: maxOut.amount });
                }}
                />
            </>
            ) : (
            <>
                {/* SPLIT: both ends rounded; the non-selected side is muted gray */}
                <CylinderSegment
                w={inW}
                h={64}
                depth={18}
                color="hsl(var(--chart-1))"
                colorDark="hsl(204 80% 40%)"
                label="Inflows"
                capLeft
                capRight
                muted={selected === "out"}
                onClick={() => {
                    setSelected("in");
                    if (maxIn) setInfo({ side: "in", account: maxIn.account, amount: maxIn.amount });
                }}
                />
                <CylinderSegment
                w={outW}
                h={64}
                depth={18}
                color="hsl(var(--chart-5))"
                colorDark="hsl(274 80% 40%)"
                label="Outflows"
                capLeft
                capRight
                muted={selected === "in"}
                onClick={() => {
                    setSelected("out");
                    if (maxOut) setInfo({ side: "out", account: maxOut.account, amount: maxOut.amount });
                }}
                />
            </>
            )}
        </div>
        </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Total Inflows</div>
          <div className="text-lg font-bold text-green-400">{formatCurrency(totalInflow, currency)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Net Flow</div>
          <div className={cn('text-lg font-bold', netFlow >= 0 ? 'text-foreground' : 'text-red-400')}>
            {formatCurrency(netFlow, currency)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total Outflows</div>
          <div className="text-lg font-bold text-purple-400">{formatCurrency(totalOutflow, currency)}</div>
        </div>
      </div>
      
       <Dialog open={!!info} onOpenChange={(isOpen) => !isOpen && closeInfo()}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle>{info?.side === 'in' ? 'Largest Inflow' : 'Largest Outflow'}</DialogTitle>
            <DialogDescription>
              The largest single transaction for this period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell className="font-medium">{info?.account}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(info?.amount || 0, currency)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
