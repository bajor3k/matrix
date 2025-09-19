// src/app/video-reports/annual/page.tsx
"use client";
import UploadCard from "@/components/video-reports/UploadCard";
import JobsTable from "@/components/video-reports/JobsTable";

export default function VRAnnualPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Annual Video Statements</h1>
      <UploadCard fixedType="annual" />
      <JobsTable fixedType="annual" />
    </main>
  );
}
