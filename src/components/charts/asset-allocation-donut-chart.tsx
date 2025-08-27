
"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { assetType: "usEquities", value: 40, fill: "var(--color-usEquities)" },
  { assetType: "intlEquities", value: 20, fill: "var(--color-intlEquities)" },
  { assetType: "fixedIncome", value: 25, fill: "var(--color-fixedIncome)" },
  { assetType: "alternatives", value: 10, fill: "var(--color-alternatives)" },
  { assetType: "cash", value: 5, fill: "var(--color-cash)" },
]

const chartConfig = {
  value: {
    label: "Percentage", // General label for the values
  },
  usEquities: {
    label: "US Equities",
    color: "hsl(var(--chart-1))",
  },
  intlEquities: {
    label: "International Equities",
    color: "hsl(var(--chart-2))",
  },
  fixedIncome: {
    label: "Fixed Income",
    color: "hsl(var(--chart-3))",
  },
  alternatives: {
    label: "Alternatives",
    color: "hsl(var(--chart-4))",
  },
  cash: {
    label: "Cash & Equivalents",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function AssetAllocationDonutChart() {
  const [activeSegmentKey, setActiveSegmentKey] = React.useState<string | null>(null)

  const activeIndex = React.useMemo(() => {
    if (!activeSegmentKey) return -1;
    return chartData.findIndex((d) => d.assetType === activeSegmentKey);
  }, [activeSegmentKey]);


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[450px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                hideLabel 
                nameKey="assetType" 
                formatter={(value, name) => [`${value}%`, chartConfig[name as keyof typeof chartConfig]?.label]}
                contentStyle={{ background: "rgba(0,0,0,0.85)", border: "none" }}
                labelStyle={{ color: "#cbd5e1" }}
                itemStyle={{ color: "#e5e7eb" }}
            />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="assetType"
            innerRadius={125} 
            outerRadius={175} 
            stroke="none"
            activeIndex={activeIndex}
            activeShape={({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent }) => {
              const label = chartConfig[payload.assetType as keyof typeof chartConfig]?.label || '';
              return (
                <g>
                  <text x={cx} y={cy! - 10} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--foreground))" className="text-lg">
                    {label}
                  </text>
                  <text x={cx} y={cy! + 15} textAnchor="middle" dominantBaseline="central" fill={fill} className="text-2xl font-bold">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius ? outerRadius + 8 : 0} 
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                  />
                </g>
              );
            }}
            onMouseEnter={(_, index) => setActiveSegmentKey(chartData[index].assetType)}
            onMouseLeave={() => setActiveSegmentKey(null)}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.assetType}
                fill={chartConfig[entry.assetType as keyof typeof chartConfig].color} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
