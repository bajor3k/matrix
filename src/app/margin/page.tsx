// src/app/margin/page.tsx
import MarginCallTable from "./components/MarginCallTable";
import MarginNearCallTable from "./components/MarginNearCallTable";

export default function MarginPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <MarginCallTable />
      <MarginNearCallTable />
    </main>
  );
}
