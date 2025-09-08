
'use client';
import * as React from 'react';
import { motion, useSpring, useInView } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

type FlowRow = { date: string; inflow: number; outflow: number };
type Timeframe = 'MTD' | 'LAST_30D' | 'QTD' | 'YTD';

const TF_LABELS: Record<Timeframe, string> = {
  MTD: 'MTD',
  LAST_30D: 'Last 30D',
  QTD: 'QTD',
  YTD: 'YTD',
};

const chipBase = 'px-3 h-8 inline-flex items-center rounded-full text-sm transition-colors border';
const chipMuted = 'border-border/30 text-muted-foreground hover:bg-muted/30';
const chipActive = 'border-primary/50 bg-primary/20 text-primary-foreground';

// --- Helper Functions ---
const startOfTimeframe = (tf: Timeframe) => {
  const now = dayjs();
  if (tf === 'MTD') return now.startOf('month');
  if (tf === 'LAST_30D') return now.subtract(29, 'day').startOf('day');
  if (tf === 'QTD') return dayjs().startOf('quarter');
  return now.startOf('year');
};

const summarizeFlows = (data: FlowRow[]) => ({
  inflow: data.reduce((a, r) => a + (r.inflow || 0), 0),
  outflow: data.reduce((a, r) => a + (r.outflow || 0), 0),
});

const formatCurrency = (value: number) => {
  'worklet';
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

// --- Animated Counter ---
function AnimatedCounter({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { damping: 50, stiffness: 200, mass: 1 });

  React.useEffect(() => {
    if (isInView) spring.set(value);
  }, [spring, value, isInView]);

  React.useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatCurrency(latest);
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref} />;
}

// --- Gauge Component ---
export function InflowOutflowGauge({
  title = 'Inflows vs Outflows',
  data,
  initialTimeframe = 'MTD',
  className,
}: {
  title?: string;
  data: FlowRow[];
  initialTimeframe?: Timeframe;
  className?: string;
}) {
  const [tf, setTf] = React.useState<Timeframe>(initialTimeframe);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const { inflow, outflow } = React.useMemo(() => {
    const start = startOfTimeframe(tf);
    const filtered = data.filter((r) => dayjs(r.date).isAfter(start.subtract(1, 'day')));
    return summarizeFlows(filtered);
  }, [data, tf]);

  const total = (inflow || 1) + (outflow || 1); // Avoid division by zero
  const inflowRatio = inflow / total;
  // Map ratio [0, 1] to angle [-80, 80]
  const angle = inflowRatio * 160 - 80;

  const net = inflow - outflow;
  const netPositive = net >= 0;

  return (
    <Card ref={ref} className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <div className="flex items-center gap-1.5">
          {(Object.keys(TF_LABELS) as Timeframe[]).map((k) => (
            <button key={k} onClick={() => setTf(k)} className={cn(chipBase, tf === k ? chipActive : chipMuted)} aria-pressed={tf === k}>
              {TF_LABELS[k]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col items-center justify-center">
        <div className="relative w-full max-w-[320px] aspect-[2/1]">
          <svg width="100%" height="100%" viewBox="0 0 320 160">
            {/* Background Arc */}
            <path d="M40 150 A110 110 0 0 1 280 150" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="24" strokeLinecap="round" />
            {/* Inflow/Outflow Arcs */}
            <path d="M40 150 A110 110 0 0 1 160 40" fill="none" stroke="var(--palette-1)" strokeWidth="20" strokeLinecap="round" />
            <path d="M160 40 A110 110 0 0 1 280 150" fill="none" stroke="var(--palette-6)" strokeWidth="20" strokeLinecap="round" />
            {/* Needle */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: isInView ? angle : 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100, mass: 0.5, delay: 0.2 }}
              style={{ transformOrigin: '160px 150px' }}
            >
              <path d="M160 150 L160 50" stroke={netPositive ? 'var(--kpi-color)' : 'var(--palette-5)'} strokeWidth="4" strokeLinecap="round" />
              <circle cx="160" cy="150" r="8" fill={netPositive ? 'var(--kpi-color)' : 'var(--palette-5)'} />
            </motion.g>
          </svg>
        </div>
        {/* Labels and Net Value */}
        <div className="w-full max-w-[360px] -mt-8 px-4">
            <div className="flex justify-between items-start text-center">
                <div className="w-24">
                    <div className="text-lg font-bold text-[var(--palette-1)]">+<AnimatedCounter value={inflow} /></div>
                    <div className="text-xs text-muted-foreground">Inflow</div>
                </div>
                 <div className="w-24">
                    <div className="text-lg font-bold text-[var(--palette-6)]">-<AnimatedCounter value={outflow} /></div>
                    <div className="text-xs text-muted-foreground">Outflow</div>
                </div>
            </div>
             <motion.div
                className="mt-4 flex items-center justify-center gap-1.5 text-2xl font-bold"
                style={{ color: netPositive ? 'var(--kpi-color)' : 'var(--palette-5)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
                transition={{ duration: 0.4, delay: 0.5 }}
            >
                <span>{netPositive ? '↑' : '↓'}</span>
                <span><AnimatedCounter value={Math.abs(net)} /></span>
                <span className="text-sm font-medium">Net</span>
            </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
