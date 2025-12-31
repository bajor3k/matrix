"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { RightSidebar } from "@/components/RightSidebar";
import Login from "@/components/Login";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. Loading State (Full Black Screen)
  if (loading) return <div className="h-screen w-full bg-black" />;

  // 2. Not Logged In -> Show Login Screen ONLY (Blocks everything else)
  if (!user) {
    return <Login />;
  }

  // 3. Logged In -> Show App (Sidebar + Content)
  return (
    <div className="relative min-h-screen">
      {/* Content Wrapper */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "mr-96" : "mr-0"}
        `}
      >
        {children}
      </div>

      {/* Right Sidebar (Only loads if user is logged in) */}
      <RightSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
