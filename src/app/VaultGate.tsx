"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function VaultGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "unlocked" | "locked">("loading");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage only on the client
    const isUnlocked = localStorage.getItem("vaultUnlocked") === "true";

    if (isUnlocked) {
      setStatus("unlocked");
    } else {
      // If not unlocked, and we are not already on the vault page, lock and redirect.
      if (pathname !== "/vault") {
        setStatus("locked");
        router.replace("/vault");
      } else {
        // If we are on the vault page, it's "unlocked" in the sense that we should render it.
        setStatus("unlocked");
      }
    }
  }, [pathname, router]);

  // While loading or if we are redirecting, render nothing to prevent content flash.
  if (status === "loading" || status === "locked") {
    return null;
  }
  
  // Only if status is "unlocked", render the children (either the app or the vault page itself).
  return <>{children}</>;
}
