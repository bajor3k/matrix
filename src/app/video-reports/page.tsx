// src/app/video-reports/page.tsx
"use client";

import { redirect } from 'next/navigation';

export default function VideoReportsPage() {
  redirect('/video-reports/monthly');
  return null;
}
