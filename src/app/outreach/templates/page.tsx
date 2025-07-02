
import { FileText } from 'lucide-react';

export default function OutreachTemplatesPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8 flex items-center">
        <FileText className="w-8 h-8 mr-3 text-primary" />
        Templates
      </h1>
      <div className="flex flex-col items-center justify-center text-center h-[60vh]">
        <p className="text-xl font-semibold text-foreground mb-2">
          Templates Page
        </p>
        <p className="text-muted-foreground">
          This section is currently under construction.
        </p>
      </div>
    </main>
  );
}
