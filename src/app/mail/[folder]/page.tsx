'use client';

import React, { useEffect, useState } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { useParams } from 'next/navigation'; // Updated import for Next.js 15
import { Loader2, AlertCircle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

// --- CONFIGURATION (YOU WILL UPDATE THIS IN STEP 4) ---
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID_GOES_HERE", // <--- WE WILL GET THIS NEXT
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000/mail/inbox", // Must match Azure exactly
  },
  cache: {
    cacheLocation: "sessionStorage", 
    storeAuthStateInCookie: false,
  }
};

type Email = {
  id: string;
  subject: string;
  sender: { emailAddress: { name: string; address: string } };
  bodyPreview: string;
  receivedDateTime: string;
};

export default function RealOutlookPage() {
  const params = useParams();
  const folderName = params?.folder as string || 'inbox';
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize MSAL outside the render cycle in a real app, 
  // but for this file-drop implementation we init here for simplicity.
  const msalInstance = new PublicClientApplication(msalConfig);

  const loginAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await msalInstance.initialize();
      
      // 1. Handle Login
      let account = msalInstance.getAllAccounts()[0];
      if (!account) {
        const loginResponse = await msalInstance.loginPopup({
          scopes: ["Mail.Read", "User.Read"]
        });
        account = loginResponse.account;
      }

      // 2. Get Token silently
      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: account,
        scopes: ["Mail.Read"]
      }).catch(async (error) => {
        if (error instanceof InteractionRequiredAuthError) {
          return await msalInstance.acquireTokenPopup({ scopes: ["Mail.Read"] });
        }
        throw error;
      });

      // 3. Initialize Graph Client
      const graphClient = Client.init({
        authProvider: (done) => done(null, tokenResponse.accessToken)
      });

      // 4. Fetch Emails
      // Map 'sent' to 'sentitems' because Microsoft is picky
      const graphFolderId = folderName === 'sent' ? 'sentitems' : 
                            folderName === 'trash' ? 'deleteditems' : 
                            folderName;

      const response = await graphClient
        .api(`/me/mailFolders/${graphFolderId}/messages`)
        .top(20)
        .select('id,subject,sender,bodyPreview,receivedDateTime')
        .orderby('receivedDateTime DESC')
        .get();

      setEmails(response.value);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to Outlook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loginAndFetch();
  }, [folderName]);

  // --- RENDER ---
  if (loading) return (
    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground gap-2">
      <Loader2 className="animate-spin h-8 w-8 text-primary"/> 
      <p>Connecting to Outlook...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 max-w-md">
        <AlertCircle className="w-5 h-5 shrink-0"/>
        <p className="text-sm">{error}</p>
      </div>
      <button onClick={() => loginAndFetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-card/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold capitalize tracking-tight">{folderName.replace('items', '')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Connected via Microsoft Graph API</p>
        </div>
        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          ● Live Connection
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Folder is empty.</div>
        ) : (
          <div className="divide-y divide-border">
            {emails.map((email) => (
              <div key={email.id} className="group flex flex-col sm:flex-row gap-3 sm:items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                
                <div className="sm:w-1/4 min-w-[150px] flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {email.sender?.emailAddress?.name?.charAt(0) || "?"}
                  </div>
                  <div className="truncate font-medium text-sm text-foreground">
                    {email.sender?.emailAddress?.name || "Unknown"}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-sm text-foreground truncate mb-0.5">
                    {email.subject || "No Subject"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {email.bodyPreview}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground whitespace-nowrap sm:w-[120px] text-right flex items-center justify-end gap-1">
                   {format(new Date(email.receivedDateTime), 'MMM d, h:mm a')}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}