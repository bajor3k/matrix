"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import Login from "@/components/Login"; 

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener automatically checks if you are logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. Loading State (Black screen)
  if (loading) return <div className="h-screen w-full bg-black" />;

  // 2. Not Logged In -> Show Login Screen
  if (!user) {
    return <Login />;
  }

  // 3. Logged In -> Show Dashboard (Your existing code)
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
       
       <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Josh</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Left Column */}
            <div className="col-span-4 space-y-4">
              
            </div>

            {/* Right Column */}
            <div className="col-span-3 space-y-4">
              
            </div>
          </div>
       </div>
    </main>
  );
}
