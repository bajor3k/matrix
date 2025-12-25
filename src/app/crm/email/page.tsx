// src/app/crm/email/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Inbox, Send, FileText, Archive, Trash2, 
  Search, RefreshCw, Paperclip, MoreVertical, Reply
} from 'lucide-react';
import { format } from 'date-fns';
import { Client } from '@microsoft/microsoft-graph-client';

// --- CONFIGURATION ---
// Set this to FALSE when you are ready to connect real Outlook
const DEMO_MODE = true; 

// --- TYPES ---
type Email = {
  id: string;
  sender: { name: string; email: string };
  subject: string;
  preview: string;
  body: string;
  date: Date;
  read: boolean;
  hasAttachment?: boolean;
};

// --- MOCK DATA (For Showcase) ---
const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    sender: { name: 'Sarah Jenkins', email: 's.jenkins@client.com' },
    subject: 'Question regarding the trust account opening',
    preview: 'Hi, I was reviewing the documents you sent over and...',
    body: "Hi,\n\nI was reviewing the documents you sent over for the trust account opening. On page 4, do I need to sign as the grantor or the trustee?\n\nAlso, can we schedule a call for Tuesday at 2 PM to go over the portfolio allocation?\n\nBest,\nSarah",
    date: new Date(),
    read: false,
  },
  {
    id: '2',
    sender: { name: 'Sanctuary Compliance', email: 'compliance@sanctuarywealth.com' },
    subject: 'ACTION REQUIRED: New Reg BI Disclosure',
    preview: 'Please review the attached updated Regulation Best Interest...',
    body: "Team,\n\nPlease review the attached updated Regulation Best Interest (Reg BI) disclosure form. This needs to be included in all new client onboarding packets effective immediately.\n\nVerify receipt of this email by EOD.\n\nRegards,\nCompliance Dept",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    hasAttachment: true,
  },
  {
    id: '3',
    sender: { name: 'Schwab Alerts', email: 'alerts@schwab.com' },
    subject: 'Trade Confirmation: BUY 500 MSFT',
    preview: 'Your trade for account ending in *8829 has executed...',
    body: "Your trade has executed.\n\nAccount: *8829\nAction: BUY\nSymbol: MSFT\nQuantity: 500\nPrice: $412.50\n\nLogin to the dashboard to view full details.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);

  // --- LOGIC: Fetch Emails (Mock or Real) ---
  useEffect(() => {
    if (DEMO_MODE) {
      setEmails(MOCK_EMAILS);
      setSelectedEmail(MOCK_EMAILS[0]);
    } else {
      // REAL OUTLOOK CONNECTION LOGIC
      // Requires 'accessToken' from your AuthProvider (Azure AD)
      /*
      const client = Client.init({
        authProvider: (done) => {
          done(null, "YOUR_ACCESS_TOKEN_HERE"); 
        }
      });
      client.api('/me/messages').top(10).get()
        .then((res) => {
             // Transform Graph API response to our Email type
             const realEmails = res.value.map(e => ({
                 id: e.id,
                 sender: { name: e.sender.emailAddress.name, email: e.sender.emailAddress.address },
                 subject: e.subject,
                 preview: e.bodyPreview,
                 body: e.body.content,
                 date: new Date(e.receivedDateTime),
                 read: e.isRead
             }));
             setEmails(realEmails);
        });
      */
    }
  }, []);

  // --- UI RENDER ---
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background">
      
      {/* 1. LEFT SIDEBAR: FOLDERS */}
      <div className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-md font-medium">
          <Inbox className="w-4 h-4" /> Inbox
          <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {emails.filter(e => !e.read).length}
          </span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md text-muted-foreground">
          <Send className="w-4 h-4" /> Sent
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md text-muted-foreground">
          <FileText className="w-4 h-4" /> Drafts
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md text-muted-foreground">
          <Archive className="w-4 h-4" /> Archive
        </button>
        <div className="mt-auto">
           <button className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500 rounded-md">
            <Trash2 className="w-4 h-4" /> Trash
          </button>
        </div>
      </div>

      {/* 2. MIDDLE COLUMN: EMAIL LIST */}
      <div className="w-full md:w-96 border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search mail..." 
              className="w-full pl-8 pr-4 py-2 bg-muted/50 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-muted rounded-md">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {emails.map(email => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedEmail?.id === email.id ? 'bg-muted border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${!email.read ? 'font-bold' : 'font-medium'}`}>
                  {email.sender.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(email.date, 'MMM d')}
                </span>
              </div>
              <div className={`text-sm mb-1 ${!email.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {email.subject}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {email.preview}
              </div>
              {email.hasAttachment && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
                  <Paperclip className="w-3 h-3" /> Attachment
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: READING PANE */}
      {selectedEmail ? (
        <div className="flex-1 flex flex-col bg-card">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-full"><Archive className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-muted rounded-full"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {selectedEmail.sender.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm">{selectedEmail.sender.name}</div>
                <div className="text-xs text-muted-foreground">{selectedEmail.sender.email}</div>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {format(selectedEmail.date, 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {selectedEmail.body}
          </div>

          <div className="p-4 border-t bg-muted/20">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <Reply className="w-4 h-4" /> Reply
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select an email to read
        </div>
      )}
    </div>
  );
}
