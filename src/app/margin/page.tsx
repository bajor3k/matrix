// src/app/margin/page.tsx
import MarginActiveCallsCard from "./components/MarginActiveCallsCard";

export default function MarginPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <MarginActiveCallsCard />
    </main>
  );
}
