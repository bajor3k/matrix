
"use client";

import React, { useState } from "react";
import {
   Lightbulb,
   ArrowUp,
   CheckCircle2,
   Hammer,
   Plus,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- DUMMY DATA FOR UI DEV ---
type FeedbackStatus = "new" | "planned" | "in-production" | "deployed";

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: FeedbackStatus;
  date: string;
}

const DUMMY_FEEDBACK: FeedbackItem[] = [
  { id: "1", title: "Real-time Options Chain Data", description: "Stream live options pricing directly into the dashboard.", votes: 142, status: "new", date: "2023-10-25" },
  { id: "2", title: "Dark Pool Analytics Integration", description: "Visualize off-exchange trading volume activity.", votes: 98, status: "in-production", date: "2023-11-01" },
  { id: "3", title: "Mobile App Notifications", description: "Push alerts for price targets and portfolio changes.", votes: 87, status: "planned", date: "2023-11-15" },
  { id: "4", title: "Excel/CSV Export for Reports", description: "Allow downloading client reports in spreadsheet format.", votes: 76, status: "deployed", date: "2023-10-10" },
  { id: "5", title: "Customizable Portfolio Groups", description: "Group clients by strategy or household custom tags.", votes: 65, status: "new", date: "2023-11-20" },
  { id: "6", title: "AI Sentiment Analysis Tool", description: "Analyze news headlines for bullish/bearish sentiment.", votes: 54, status: "in-production", date: "2023-11-05" },
  { id: "7", title: "Two-Factor Authentication (2FA)", description: "Enhanced security for advisor logins.", votes: 43, status: "deployed", date: "2023-09-01" },
  { id: "8", title: "Integration with Salesforce CRM", description: "Sync contacts directly with Salesforce.", votes: 32, status: "new", date: "2023-11-22" },
];

// Helper to categorize data
const topVoted = [...DUMMY_FEEDBACK].filter(f => f.status === 'new' || f.status === 'planned').sort((a, b) => b.votes - a.votes).slice(0, 2);
const inProduction = DUMMY_FEEDBACK.filter(f => f.status === "in-production");
const deployed = DUMMY_FEEDBACK.filter(f => f.status === "deployed");
const allRequestsSortByDate = [...DUMMY_FEEDBACK].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


export default function FeedbackPage() {
  // This state is just for the UI demo to show clicking works
  const [feedbackList, setFeedbackList] = useState(allRequestsSortByDate);

   const handleVote = (id: string) => {
      // Temporary logic to simulate a vote update in the UI
      setFeedbackList(prev => prev.map(item => 
           item.id === id ? { ...item, votes: item.votes + 1 } : item
      ));
  };

   return (
    <div className="flex h-full flex-col space-y-8 p-8">
      
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Feedback & Roadmap
          </h1>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Submit Idea
        </Button>
      </div>

       {/* --- Top Section: Highlights Columns --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
         {/* Column 1: Top Voted (Blue theme) */}
        <HighlightColumn 
             title="Top Voted" 
             icon={<ArrowUp className="h-5 w-5 text-blue-500" />}
            borderColor="border-blue-500/30"
            bgColor="bg-blue-50/50 dark:bg-blue-950/20"
            items={topVoted}
        />

         {/* Column 2: In Production (Amber theme) */}
        <HighlightColumn 
             title="In Production" 
             icon={<Hammer className="h-5 w-5 text-amber-500" />}
            borderColor="border-amber-500/30"
            bgColor="bg-amber-50/50 dark:bg-amber-950/20"
            items={inProduction}
        />
        
          {/* Column 3: Deployed (Green theme) */}
         <HighlightColumn 
             title="Deployed" 
             icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            borderColor="border-green-500/30"
            bgColor="bg-green-50/50 dark:bg-green-950/20"
            items={deployed}
        />
      </div>

       {/* --- Bottom Section: All Requests List --- */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-zinc-500" />
                All Suggestions ({feedbackList.length})
            </h2>

             {/* Placeholder for sorting controls later */}
            <select className="text-sm rounded-md border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 p-1">
                <option>Newest</option>
                <option>Most Votes</option>
            </select>
        </div>
        
         <div className="space-y-3">
            {feedbackList.map(item => (
                <FeedbackListItem key={item.id} item={item} onVote={() => handleVote(item.id)} />
            ))}
        </div>
      </div>

     </div>
  );
}

// --- Internal Components for Layout ---

// 1. The top highlight cards
function HighlightColumn({ title, icon, borderColor, bgColor, items }: { title: string, icon: React.ReactNode, borderColor: string, bgColor: string, items: FeedbackItem[] }) {
    return (
        <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 flex flex-col h-full`}>
            <div className="flex items-center gap-2 mb-4 font-semibold text-zinc-900 dark:text-white">
                {icon}
                <span>{title}</span>
            </div>
            <div className="space-y-3 flex-1">
                {items.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">Nothing here yet.</p>
                ) : items.map(item => (
                    <div key={item.id} className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 shadow-sm">
                        <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{item.title}</h3>
                         <div className="flex items-center justify-between mt-2">
                             <StatusBadge status={item.status} />
                             <div className="text-xs font-medium flex items-center text-zinc-600 dark:text-zinc-400">
                                <ChevronUp className="h-3 w-3 mr-1" /> {item.votes}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Optional "View All" link for future use */}
            {/* <button className="text-xs text-zinc-500 mt-3 hover:underline text-left">View all...</button> */}
        </div>
    )
}

// 2. The main list items at the bottom
function FeedbackListItem({ item, onVote }: { item: FeedbackItem, onVote: () => void }) {
    return (
        <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-4 flex items-start gap-4 transition-all hover:border-zinc-300 dark:hover:border-white/20">
            
             {/* Vote Button */}
            <button onClick={onVote} className="flex flex-col items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 min-w-[60px] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group">
                <ChevronUp className="h-5 w-5 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-bold text-lg text-zinc-700 dark:text-zinc-300 group-hover:text-blue-500 transition-colors">{item.votes}</span>
            </button>
            
             {/* Content */}
            <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                     <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                     <span className="text-xs text-zinc-500 ml-2 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{item.description}</p>
                <StatusBadge status={item.status} />
            </div>
        </div>
    )
}

// 3. Helper utility for status badges
function StatusBadge({ status }: { status: FeedbackStatus }) {
    switch (status) {
        case "new":
        case "planned":
            return <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Open</span>;
        case "in-production":
            return <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500">In Production</span>;
        case "deployed":
             return <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-500">Deployed</span>;
        default:
            return null;
    }
}
