"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const BG = "bg-[#000000]";
const CARD = "bg-[#0e0f12] border border-[#262a33]";
const BTN =
  "rounded-xl ring-1 ring-inset ring-[#262a33] bg-zinc-200/5 hover:bg-zinc-200/10 text-zinc-100";
const CODE_LEN = 4; // change if you want 6 etc.

export default function VaultPage() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [unlocking, setUnlocking] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const VALID_CODE = useMemo(
    () => (process.env.NEXT_PUBLIC_VAULT_CODE || "1955").trim(),
    []
  );

  useEffect(() => {
    // If already unlocked, skip
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("vaultUnlocked") === "true"
    ) {
      router.replace("/");
    }
  }, [router]);

  const onDigit = (d: string) => {
    setError("");
    if (unlocking || doorOpen) return;
    setCode((prev) => (prev + d).slice(0, CODE_LEN));
  };

  const onBack = () => {
    if (unlocking || doorOpen) return;
    setError("");
    setCode((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (code.length === CODE_LEN) {
      if (code === VALID_CODE) {
        // success
        setUnlocking(true);
        setTimeout(() => setDoorOpen(true), 600); // start door animation
        setTimeout(() => {
          localStorage.setItem("vaultUnlocked", "true");
          router.replace("/"); // or "/dashboard"
        }, 1400);
      } else {
        // wrong code → shake + clear
        setError("Incorrect code");
        const t = setTimeout(() => setCode(""), 400);
        return () => clearTimeout(t);
      }
    }
  }, [code, VALID_CODE, router]);

  // dial angle based on code progress
  const angle = (code.length / CODE_LEN) * 360;

  return (
    <div
      className={`${BG} min-h-[100dvh] flex items-center justify-center p-6`}
    >
      <div
        className={`w-full max-w-3xl ${CARD} rounded-2xl p-6 shadow-xl`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dial / Vault Face */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <motion.div
                className={`absolute inset-0 ${CARD} rounded-full flex items-center justify-center`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="w-40 h-40 rounded-full border border-[#262a33] flex items-center justify-center"
                  animate={{ rotate: angle }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                  <div className="w-2 h-8 rounded bg-zinc-300" />
                </motion.div>
              </motion.div>
              {/* Door */}
              <AnimatePresence>
                {unlocking && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-emerald-400/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                {doorOpen && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 100%)" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    {/* door panel */}
                    <div className="w-full h-full rounded-full bg-[#111214] border border-[#262a33]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Keypad / Input */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-wide">
              Enter Access Code
            </h1>
            <p className="text-sm text-zinc-400">
              Unlock to continue to your dashboard.
            </p>

            <motion.div
              className={`mt-4 ${CARD} rounded-xl p-4`}
              animate={error ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.28 }}
            >
              <div className="flex items-center gap-2">
                {Array.from({ length: CODE_LEN }).map((_, i) => {
                  const filled = i < code.length;
                  return (
                    <div
                      key={i}
                      className={`h-12 flex-1 rounded-lg border ${
                        filled
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-[#262a33] bg-[#0e0f12]"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 h-5 text-sm text-red-400">{error}</div>
            </motion.div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "✓"].map(
                (k) => (
                  <button
                    key={k}
                    className={`${BTN} h-12 text-lg`}
                    onClick={() => {
                      if (k === "←") onBack();
                      else if (k === "✓") {
                        // no-op: validation auto-triggers at CODE_LEN
                        if (code.length < CODE_LEN) setError("Enter full code");
                      } else onDigit(k);
                    }}
                    disabled={unlocking || doorOpen}
                  >
                    {k}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Tip: Set your code in{" "}
              <code className="text-zinc-300">NEXT_PUBLIC_VAULT_CODE</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
