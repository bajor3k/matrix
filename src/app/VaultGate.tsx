"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function VaultGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // /vault should always be allowed
    if (pathname === "/vault") {
      setReady(true);
      return;
    }

    const unlocked = typeof window !== "undefined" && localStorage.getItem("vaultUnlocked") === "true";

    if (!unlocked) {
      router.replace("/vault");
      // Don't set ready to true, let the redirect happen
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) return null; // Or a loading spinner

  return <>{children}</>;
}
