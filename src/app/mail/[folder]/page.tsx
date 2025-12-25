'use client';

import React, { useEffect, useState } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Search, RefreshCw, MoreVertical, Reply, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// --- AUTH CONFIGURATION ---
const msalConfig = {
  auth: {
    // 🟢 YOUR REAL AZURE ID IS NOW HERE:
    clientId: "6fb55bec-40a9-406b-9f9b-5a607939f74f", 
    authority: "https://login.microsoftonline.com/common",
    // Ensure this matches EXACTLY what you put in Azure:
    redirectUri: "http://localhost:3000/mail/inbox", 
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

// Initialize MSAL outside component to prevent "Interaction in progress" errors
const msalInstance = new PublicClientApplication(msalConfig);

type Email = {
  id: string;
  subject: string;
  sender: { emailAddress: { name: string; address: string } };
  bodyPreview: string;
  body: { content: string; contentType: string };
  receivedDateTime: string;
  isRead: boolean;
};

export default function RealOutlookPage() {
  const params = useParams();
  const folderName = params?.folder as string || 'inbox';
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!msalInstance.getActiveAccount()) {
         await msalInstance.initialize();
      }
      
      let account = msalInstance.getAllAccounts()[0];
      if (!account) {
        const loginResponse = await msalInstance.loginPopup({
          scopes: ["Mail.Read", "User.Read"]
        });
        account = loginResponse.account;
      }
      msalInstance.setActiveAccount(account); 

      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: account,
        scopes: ["Mail.Read"]
      }).catch(async (error) => {
        if (error instanceof InteractionRequiredAuthError) {
          return await msalInstance.acquireTokenPopup({ scopes: ["Mail.Read"] });
        }
        throw error;
      });

      if (!tokenResponse) {
        throw new Error("Could not acquire token.");
      }

      const graphClient = Client.init({
        authProvider: (done) => done(null, tokenResponse.accessToken)
      });

      // Map URL params to Graph API folder IDs
      const graphFolderId = folderName === 'sentitems' ? 'sentitems' : 
                            folderName === 'deleteditems' ? 'deleteditems' : 
                            folderName === 'junkemail' ? 'junkemail' :
                            folderName;

      // Fetch emails WITH full body
      const response = await graphClient
        .api(`/me/mailFolders/${graphFolderId}/messages`)
        .top(15)
        .select('id,subject,sender,bodyPreview,receivedDateTime,isRead,body')
        .orderby('receivedDateTime DESC')
        .get();

      setEmails(response.value);
      if (response.value.length > 0) {
        setSelectedEmail(response.value[0]); // Auto-select first email
      }
    } catch (err: any) {
      console.error(err);
      if (err.errorCode === "interaction_in_progress") {
         setError("Login popup is open in another window. Close it or refresh.");
      } else if (err.message?.includes("unauthorized_client")) {
         setError("Client ID Error: Ensure your Azure App is set to 'Multitenant + Personal'.");
      } else {
         setError(err.message || "Failed to connect.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loginAndFetch();
  }, [folderName]);

  // --- RENDER ---
  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2 h-5 w-5"/> Loading Outlook...</div>;
  
  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 max-w-md border border-red-100">
        <AlertCircle className="w-5 h-5 shrink-0"/>
        <p className="text-sm font-medium">{error}</p>
      </div>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Retry</button>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-background divide-x divide-border overflow-hidden">
      
      {/* 1. EMAIL LIST (Middle Column) */}
      <div className="w-[400px] flex flex-col bg-card/50">
        {/* Toolbar */}
        <div className="p-3 border-b flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search" 
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 rounded-md outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button onClick={() => loginAndFetch()} className="p-2 hover:bg-muted rounded"><RefreshCw className="w-4 h-4 text-muted-foreground"/></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`
                p-4 border-b cursor-pointer transition-colors flex flex-col gap-1
                ${selectedEmail?.id === email.id ? 'bg-accent/50 border-l-4 border-l-primary' : 'hover:bg-muted/30 border-l-4 border-l-transparent'}
                ${!email.isRead ? 'font-semibold' : ''}
              `}
            >
              <div className="flex justify-between items-baseline">
                <span className="truncate text-sm font-medium text-foreground">{email.sender?.emailAddress?.name}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                  {format(new Date(email.receivedDateTime), 'h:mm a')}
                </span>
              </div>
              <div className="text-sm truncate text-foreground/90">{email.subject || "No Subject"}</div>
              <div className="text-xs text-muted-foreground line-clamp-2 font-normal">
                {email.bodyPreview}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. READING PANE (Right Column) */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {selectedEmail ? (
          <>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-foreground">{selectedEmail.subject}</h2>
                <div className="flex gap-1 text-muted-foreground">
                   <button className="p-2 hover:bg-muted rounded"><Reply className="w-4 h-4"/></button>
                   <button className="p-2 hover:bg-muted rounded"><Archive className="w-4 h-4"/></button>
                   <button className="p-2 hover:bg-muted rounded hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {selectedEmail.sender?.emailAddress?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{selectedEmail.sender?.emailAddress?.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedEmail.sender?.emailAddress?.address}</div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(selectedEmail.receivedDateTime), 'PPP p')}
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* We render HTML directly to simulate Outlook. In prod, use DOMPurify. */}
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body?.content || selectedEmail.bodyPreview }} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MoreVertical className="w-8 h-8 opacity-50"/>
            </div>
            <p>Select an item to read</p>
          </div>
        )}
      </div>

    </div>
  );
}
