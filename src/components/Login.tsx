
"use client";

import { useState } from "react";
import { setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. SET PERSISTENCE TO 'SESSION' (Clears on tab close)
      await setPersistence(auth, browserSessionPersistence);
      
      // 2. THEN SIGN IN
      await signInWithEmailAndPassword(auth, email, password);
      
    } catch (err: any) {
      console.error(err);
      setError("Access Denied: Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="w-full max-w-sm space-y-8 rounded-xl border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
        <div className="space-y-2">
          {/* Use your logo if you have one, otherwise just text */}
          <h1 className="text-3xl font-bold text-white tracking-tight">Matrix</h1>
          <p className="text-sm text-zinc-500">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Identity"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            required
          />
          <Input
            type="password"
            placeholder="Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            required
          />
          
          {error && <p className="text-xs text-red-500 font-mono">{error}</p>}

          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-zinc-200 font-semibold transition-all" 
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Initialize Session"}
          </Button>
        </form>
      </div>
    </div>
  );
}
