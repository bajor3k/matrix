
"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { RightSidebar } from "@/components/RightSidebar";
import Login from "@/components/Login";
import AppShell from "./AppShell";

// Add 'sidebar' to props
export function ClientLayout({ children }: { children: React.ReactNode}) {
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

  // 1. Loading State
  if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500">Loading Matrix...</div>;

  // 2. Not Logged In -> Show Login (And NOTHING else)
  if (!user) {
    return <Login />;
  }

  // 3. Logged In -> Show Sidebar + App
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "mr-96" : "mr-0"}
          `}
        >
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
