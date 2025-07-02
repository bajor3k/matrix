
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { BarChart } from 'lucide-react'; // Example icon

export default function WingerMatrixPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
        Winger Matrix
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        <PlaceholderCard
          title="Card Title 1"
          value="$0"
          description="Placeholder metric"
          icon={BarChart} 
        />
        <PlaceholderCard
          title="Card Title 2"
          value="$0"
          description="Placeholder metric"
          icon={BarChart} 
        />
        <PlaceholderCard
          title="Card Title 3"
          value="$0"
          description="Placeholder metric"
          icon={BarChart} 
        />
      </div>
    </main>
  );
}
