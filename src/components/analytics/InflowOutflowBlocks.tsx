
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Types ---
type FlowDataPoint = {
  account: string;
  amount: number;
};

interface CylinderSegmentProps {
  type: 'inflow' | 'outflow';
  value: number;
  width: number; // 0-100
  active: boolean;
  onClick: () => void;
  depth?: number;
  color?: string;
  colorDark?: string;
  className?: string;
}

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

// --- Sub-components ---
const CylinderSegment: React.FC<CylinderSegmentProps> = ({
  type,
  value,
  width,
  active,
  onClick,
  depth = 24,
  color = '#4ade80',
  colorDark = '#166534',
  className,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'group relative h-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-white/50 rounded-full',
      className
    )}
    style={{ width: `${width}%` }}
    aria-label={`${type} amount ${formatCurrency(value)}`}
  >
    <div className="absolute inset-0 overflow-visible">
      {/* Main Body */}
      <div
        className="h-full rounded-full transition-colors duration-300"
        style={{
          background: `linear-gradient(90deg, ${colorDark}, ${color})`,
          opacity: active ? 1 : 0.4,
        }}
      ></div>
      {/* Extrusion Effect */}
      <div
        className="absolute top-0 left-0 h-full w-full rounded-full transition-colors duration-300"
        style={{
          background: colorDark,
          transform: `translateZ(-${depth}px)`,
          opacity: active ? 1 : 0.3,
        }}
      ></div>
      {/* Front Cap */}
      <div
        className={cn(
          'absolute h-full rounded-full transition-all duration-300 ease-in-out',
          type === 'inflow' ? 'right-0' : 'left-0'
        )}
        style={{
          width: `${depth * 2}px`,
          background: color,
          transform: type === 'inflow' ? `translateX(${depth}px)` : `translateX(-${depth}px)`,
          opacity: active ? 1 : 0.4,
        }}
      ></div>
    </div>
  </button>
);


// --- Main Component ---
export const InflowOutflowBlocks: React.FC<InflowOutflowBlocksProps> = ({
  inflows,
  outflows,
  currency = 'USD',
  title = 'Inflow vs. Outflow',
}) => {
  const [activeSide, setActiveSide] = React.useState<'inflow' | 'outflow' | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const totalInflow = React.useMemo(() => inflows.reduce((sum, item) => sum + item.amount, 0), [inflows]);
  const totalOutflow = React.useMemo(() => outflows.reduce((sum, item) => sum + item.amount, 0), [outflows]);
  const netFlow = totalInflow - totalOutflow;
  const grandTotal = totalInflow + totalOutflow;

  const inW = grandTotal > 0 ? (totalInflow / grandTotal) * 100 : 50;
  const outW = grandTotal > 0 ? (totalOutflow / grandTotal) * 100 : 50;

  const largestInflow = React.useMemo(() => findLargest(inflows), [inflows]);
  const largestOutflow = React.useMemo(() => findLargest(outflows), [outflows]);
  
  const modalData = activeSide === 'inflow' ? largestInflow : largestOutflow;
  const modalTitle = activeSide === 'inflow' ? 'Largest Inflow' : 'Largest Outflow';

  const handleSegmentClick = (side: 'inflow' | 'outflow') => {
    setActiveSide(side);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Delay resetting active side to allow modal to fade out
    setTimeout(() => setActiveSide(null), 300);
  };

  return (
    <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-lg">
      <h3 className="text-base font-bold text-foreground mb-6 text-center">{title}</h3>
      <div
        className="relative mx-auto flex h-12 max-w-lg items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="flex h-full w-full items-center"
          animate={{ gap: activeSide ? '24px' : '0px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <CylinderSegment
            type="inflow"
            value={totalInflow}
            width={inW}
            active={activeSide === null || activeSide === 'inflow'}
            onClick={() => handleSegmentClick('inflow')}
            color="hsl(var(--chart-1))"
            colorDark="hsl(204 80% 40%)"
          />
          <CylinderSegment
            type="outflow"
            value={totalOutflow}
            width={outW}
            active={activeSide === null || activeSide === 'outflow'}
            onClick={() => handleSegmentClick('outflow')}
            color="hsl(var(--chart-5))"
            colorDark="hsl(274 80% 40%)"
          />
        </motion.div>
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
      
       <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
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
                    <TableCell className="font-medium">{modalData.account}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(modalData.amount, currency)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
