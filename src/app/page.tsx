"use client";

import React from "react";

export default function Home() {
  // No auth logic needed here anymore!
  
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
