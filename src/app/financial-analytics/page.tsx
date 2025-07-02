
import { DollarSign, TrendingUp, CreditCard, Target } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const topMetricCardsData = [
  {
    title: "Total Revenue",
    value: "$2.3M",
    description: "+12% this quarter",
    icon: DollarSign,
  },
  {
    title: "Net Profit Margin",
    value: "18.5%",
    description: "Improved by 2%",
    icon: TrendingUp,
  },
  {
    title: "Operational Costs",
    value: "$850K",
    description: "-3% from last quarter",
    icon: CreditCard,
  },
];

const averageRevenueData = {
  title: "Average Revenue per Client",
  value: "$12,450",
  description: "+5% vs. previous quarter",
  icon: DollarSign,
};

const grossMarginData = {
  title: "Target Gross Margin",
  value: "42%",
  progressNumericValue: 42,
  icon: Target,
};

export default function FinancialAnalyticsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topMetricCardsData.map((card, index) => (
          <PlaceholderCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PlaceholderCard
          title={averageRevenueData.title}
          value={averageRevenueData.value}
          description={averageRevenueData.description}
          icon={averageRevenueData.icon}
        />
        <PlaceholderCard
          title={grossMarginData.title}
          value={grossMarginData.value}
          icon={grossMarginData.icon}
        >
          <Progress
            value={grossMarginData.progressNumericValue}
            className={cn(
              "h-3 mt-2",
              grossMarginData.progressNumericValue >= 40 ? "[&>div]:bg-[hsl(var(--chart-3))]" : // Green
              grossMarginData.progressNumericValue >= 30 ? "[&>div]:bg-[hsl(var(--chart-4))]" : // Yellow
                                                            "[&>div]:bg-[hsl(var(--chart-5))]"  // Red
            )}
            aria-label={`Gross Margin ${grossMarginData.progressNumericValue}%`}
          />
        </PlaceholderCard>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <PlaceholderCard title="Revenue vs. Expenses">
          <div className="h-[300px]">
            <PlaceholderChart dataAiHint="revenue expenses" />
          </div>
        </PlaceholderCard>
        <PlaceholderCard title="Cash Flow Projection">
           <div className="h-[300px]">
            <PlaceholderChart dataAiHint="cash flow" />
          </div>
        </PlaceholderCard>
      </div>
    </main>
  );
}
