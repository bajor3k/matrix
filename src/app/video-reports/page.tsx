// src/app/video-reports/page.tsx
"use client";

import UploadCard from "@/components/video-reports/UploadCard";

export default function VideoReportsPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Video Reports
      </h1>
      <UploadCard />
    </main>
  );
}
