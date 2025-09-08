
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

// --- Animated Counter Component ---
function AnimatedCounter({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, {
    damping: 50,
    stiffness: 200,
    mass: 1,
  });

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  React.useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatCurrency(latest);
      }
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref} />;
}

// --- Main Battle Meter Component ---
export function BattleMeterKPI({
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
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const { inflow, outflow } = React.useMemo(() => {
    const start = startOfTimeframe(tf);
    const filtered = data.filter((r) => dayjs(r.date).isAfter(start.subtract(1, 'day')));
    return summarizeFlows(filtered);
  }, [data, tf]);

  const total = inflow + outflow;
  const net = inflow - outflow;
  const inflowPct = total > 0 ? (inflow / total) * 100 : 50;
  const netColor = net >= 0 ? 'var(--palette-1)' : 'var(--palette-6)';
  const netArrow = net >= 0 ? '↑' : '↓';

  return (
    <Card ref={ref} className={cn('flex flex-col', className)}>
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
      <CardContent className="flex flex-grow flex-col justify-center">
        <div className="relative mb-2 flex h-12 items-center justify-between gap-4">
          {/* Left Side: Inflow */}
          <div className="w-24 shrink-0 text-left">
            <div className="text-lg font-bold" style={{ color: 'var(--palette-1)' }}>
              +<AnimatedCounter value={inflow} />
            </div>
            <div className="text-xs text-muted-foreground">Inflow</div>
          </div>

          {/* Center: Progress Bar */}
          <div className="relative mx-auto h-6 w-full flex-1 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-l-full"
              style={{ background: 'var(--palette-1)' }}
              initial={{ width: '0%' }}
              animate={{ width: isInView ? `${inflowPct}%` : '0%' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full rounded-r-full"
              style={{ background: 'var(--palette-6)' }}
              initial={{ width: '0%' }}
              animate={{ width: isInView ? `${100 - inflowPct}%` : '0%' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Right Side: Outflow */}
          <div className="w-24 shrink-0 text-right">
            <div className="text-lg font-bold" style={{ color: 'var(--palette-6)' }}>
              -<AnimatedCounter value={outflow} />
            </div>
            <div className="text-xs text-muted-foreground">Outflow</div>
          </div>
        </div>

        {/* Center: Net Value */}
        <div className="relative mt-2 flex justify-center">
          <motion.div
            className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-lg font-bold shadow-md"
            style={{ borderColor: netColor, color: netColor }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 10, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <span>{netArrow}</span>
            <span>
              <AnimatedCounter value={Math.abs(net)} />
            </span>
            <span className="text-sm font-medium">Net</span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
