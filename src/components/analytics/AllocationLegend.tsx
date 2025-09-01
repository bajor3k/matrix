
import React from "react";

type LegendItem = {
  label: string;
  value?: string;  // e.g. "40%"
  color: string;   // CSS color token (e.g., "var(--palette-1)")
};

export function AllocationLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between rounded-md"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
          {item.value && (
            <span className="text-sm text-foreground">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
