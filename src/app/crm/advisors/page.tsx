"use client";

import React from "react";
import { 
  Plus, 
  Settings, 
  Filter, 
  Download, 
  Upload, 
  Tag, 
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdvisorsPage() {
  return (
    <div className="flex h-full flex-col space-y-6 p-8">
      
      {/* --- Top Header & Controls --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Title & Count */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">client</h1>
          <div className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            0
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Sorting / Ordering Links */}
          <div className="hidden text-sm text-zinc-500 md:flex md:items-center md:gap-3">
            <span>Order:</span>
            <button className="font-medium text-zinc-900 hover:underline dark:text-white">Recent</button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">Created</button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">A-Z</button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">Z-A</button>
          </div>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-2 hidden md:block" />

          {/* Action Buttons */}
          <Button variant="outline" size="sm" className="bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button variant="outline" size="sm" className="bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Options
          </Button>

          {/* Green Add Button */}
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-medium border-none shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Advisor
          </Button>
        </div>
      </div>

      {/* --- Main Content Layout --- */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        
        {/* LEFT COLUMN: Data Table */}
        {/* UPDATED: bg-zinc-50 for off-white light mode */}
        <div className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 overflow-hidden">
          
          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 bg-zinc-100/50 px-4 py-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400">
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="rounded border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800" />
            </div>
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Tags</div>
          </div>

          {/* Table Body - Empty State */}
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 dark:text-zinc-400">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-800/50">
              <Search className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-lg font-medium text-zinc-900 dark:text-white">No advisors found</p>
            <p className="text-sm">Get started by adding a new advisor.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Tags & Import) */}
        <div className="w-full space-y-6 lg:w-80">
          
          {/* Tags Widget */}
          {/* UPDATED: bg-zinc-50 for off-white light mode */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Tag className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Tags
              </h3>
              <button className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400">Manage Tags</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-400">
                VIP
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-400">
                Prospect
              </span>
            </div>
          </div>

          {/* Import / Export Widget */}
          {/* UPDATED: bg-zinc-50 for off-white light mode */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 overflow-hidden">
            <div className="bg-zinc-100/50 px-4 py-3 border-b border-zinc-200 dark:border-white/10 dark:bg-zinc-900/80">
               <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Data Tools</h3>
            </div>
            
            <div className="divide-y divide-zinc-200 dark:divide-white/10">
              <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                   <Upload className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Import</div>
                  <div className="text-xs text-zinc-500">CSV, Excel, Outlook</div>
                </div>
              </button>

              <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                   <Download className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Export</div>
                  <div className="text-xs text-zinc-500">Download CSV list</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
