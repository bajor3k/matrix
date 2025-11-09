"use client";

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function RootPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);

  return null; // Render nothing, redirect will handle it
}
