
import { DollarSign, TrendingUp, CreditCard, Target } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const topMetricCardsData = [
  {
    title: "Total Revenue",
    value: "$2.3M",
    icon: DollarSign,
  },
  {
    title: "Net Profit Margin",
    value: "18.5%",
    icon: TrendingUp,
  },
  {
    title: "Operational Costs",
    value: "$850K",
    icon: CreditCard,
  },
  {
    title: "Average Revenue per Client",
    value: "$12,450",
    icon: DollarSign,
  },
];

export default function FinancialAnalyticsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
