"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function VaultGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "unlocked" | "locked">("loading");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // The /vault page is always accessible
    if (pathname === "/vault") {
      setStatus("unlocked"); // In this context, "unlocked" means "allowed to see this page"
      return;
    }

    // Check localStorage only on the client
    const isUnlocked = localStorage.getItem("vaultUnlocked") === "true";

    if (isUnlocked) {
      setStatus("unlocked");
    } else {
      setStatus("locked");
      router.replace("/vault");
    }
  }, [pathname, router]);

  // While loading, render nothing to prevent content flash
  if (status === "loading") {
    return null;
  }
  
  // If locked and redirecting, also render nothing.
  if (status === "locked") {
    return null;
  }

  // Only if status is explicitly "unlocked", render the children.
  return <>{children}</>;
}
