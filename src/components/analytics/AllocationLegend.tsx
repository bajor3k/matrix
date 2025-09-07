
import React from "react";

type LegendItem = {
  label: string;
  value?: string;  // e.g. "40%"
  color: string;   // CSS color token (e.g., "var(--palette-1)")
};

export function AllocationLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between rounded-md"
        >
          <div className="flex items-center gap-4">
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-base text-muted-foreground">{item.label}</span>
          </div>
          {item.value && (
            <span className="text-base font-semibold text-foreground">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
