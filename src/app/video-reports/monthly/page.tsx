// src/app/video-reports/monthly/page.tsx
"use client";
import UploadCard from "@/components/video-reports/UploadCard";
import JobsTable from "@/components/video-reports/JobsTable";

export default function VRMonthlyPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Monthly Video Statements</h1>
      <UploadCard fixedType="monthly" />
      <JobsTable fixedType="monthly" />
    </main>
  );
}
