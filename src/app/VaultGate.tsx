
"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function VaultGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // On component mount, check the localStorage for the unlock status.
    const unlocked = localStorage.getItem("vaultUnlocked") === "true";
    setIsUnlocked(unlocked);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    // This effect runs whenever the checking status, lock status, or path changes.
    if (isChecking) {
      // Don't do anything while we're still checking localStorage.
      return;
    }

    if (!isUnlocked && pathname !== "/vault") {
      // If the vault is locked and we are not on the vault page, redirect there.
      router.replace("/vault");
    }
  }, [isChecking, isUnlocked, pathname, router]);

  if (isChecking) {
    // While checking the status, render nothing to prevent any flash of content.
    return null;
  }
  
  if (!isUnlocked && pathname !== "/vault") {
    // While redirecting, also render nothing.
    return null;
  }

  // If we've passed all checks, render the page content.
  return <>{children}</>;
}
