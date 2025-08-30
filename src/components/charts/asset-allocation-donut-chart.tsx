
"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { assetType: "usEquities", value: 40, fill: "var(--palette-1)" },
  { assetType: "intlEquities", value: 20, fill: "var(--palette-2)" },
  { assetType: "fixedIncome", value: 25, fill: "var(--palette-3)" },
  { assetType: "alternatives", value: 10, fill: "var(--palette-4)" },
  { assetType: "cash", value: 5, fill: "var(--palette-5)" },
]

const chartConfig = {
  value: {
    label: "Percentage",
  },
  usEquities: {
    label: "US Equities",
  },
  intlEquities: {
    label: "International Equities",
  },
  fixedIncome: {
    label: "Fixed Income",
  },
  alternatives: {
    label: "Alternatives",
  },
  cash: {
    label: "Cash & Equivalents",
  },
} satisfies ChartConfig

export function AssetAllocationDonutChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const activeSegment = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[450px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => [
                `${value}%`,
                chartConfig[name as keyof typeof chartConfig]?.label,
              ]}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="assetType"
          innerRadius={125}
          outerRadius={175}
          strokeWidth={2}
          stroke="hsl(var(--card))"
          activeIndex={activeIndex ?? undefined}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          activeShape={({
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
          }) => {
            const label = chartConfig[payload.assetType as keyof typeof chartConfig]?.label || ''
            return (
              <g>
                <text
                  x={cx}
                  y={cy! - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="hsl(var(--foreground))"
                  className="text-lg"
                >
                  {label}
                </text>
                <text
                  x={cx}
                  y={cy! + 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={fill}
                  className="text-2xl font-bold"
                >
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
            )
          }}
        />
      </PieChart>
    </ChartContainer>
  )
}
