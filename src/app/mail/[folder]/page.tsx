'use client';

import React, { useEffect, useState } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// 1. DEFINE CONFIG OUTSIDE
const msalConfig = {
  auth: {
    clientId: "e.g. a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890", // <--- Ensure your ID is here
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000/mail/inbox",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

// 2. INITIALIZE INSTANCE OUTSIDE (This fixes the error)
const msalInstance = new PublicClientApplication(msalConfig);

export default function RealOutlookPage() {
  const params = useParams();
  const folderName = params?.folder as string || 'inbox';
  
  const [emails, setEmails] = useState<any[]>([]); // simplified type for brevity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize only if not already initialized
      if (!msalInstance.getActiveAccount()) {
         await msalInstance.initialize();
      }
      
      // ... rest of your login logic (same as before) ...
      let account = msalInstance.getAllAccounts()[0];
      if (!account) {
        const loginResponse = await msalInstance.loginPopup({
          scopes: ["Mail.Read", "User.Read"]
        });
        account = loginResponse.account;
      }
      
      // Set active account to prevent further "interaction" errors
      if (account) {
        msalInstance.setActiveAccount(account); 
      }

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

      const graphFolderId = folderName === 'sent' ? 'sentitems' : 
                            folderName === 'trash' ? 'deleteditems' :
                            folderName === 'junk' ? 'junkemail' :
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
      // Clean up error message
      if (err.errorCode === "interaction_in_progress") {
         setError("Login popup is already open. Please check your other windows.");
      } else {
         setError(err.message || "Failed to connect to Outlook.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loginAndFetch();
  }, [folderName]);

  // ... Render logic stays the same ...
  if (loading) return <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2"/> Connecting...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error} <br/><button onClick={() => window.location.reload()} className="mt-4 underline">Refresh Page</button></div>;

  return (
    // ... Paste your previous return (render) code here ...
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
