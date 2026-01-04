"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all visitors of the root page to the dashboard.
    // Auth is handled in ClientLayout, so we only reach this if authenticated.
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm font-medium text-zinc-400">Loading Matrix System...</p>
      </div>
    </main>
  );
}
