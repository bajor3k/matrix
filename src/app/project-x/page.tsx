
import { Brain } from 'lucide-react';

export default function ProjectXPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8 flex items-center justify-center">
        <Brain className="w-10 h-10 mr-3 text-primary" /> {/* Brain icon from Lucide */}
        Project X
      </h1>
      <div className="flex flex-col items-center justify-center text-center h-[60vh]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-5 h-5 rounded-full bg-primary animate-ping"></div>
        </div>
        <p className="text-4xl font-bold tracking-wide text-white mb-4">
          COMING SOON
        </p>
        <p className="text-sm text-gray-400 mt-2">
          We're training something big...
        </p>
      </div>
    </main>
  );
}
