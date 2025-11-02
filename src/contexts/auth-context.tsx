
// src/contexts/auth-context.tsx
"use client";

import type { User } from "firebase/auth";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type OAuthCredential } from "firebase/auth";
import * as React from "react";
import { auth, googleAuthProvider } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signInWithGoogleAndGetGmailToken: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setAccessToken(token);
      } else {
        setAccessToken(null); // Clear access token on sign out
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogleAndGetGmailToken = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = result.credential as OAuthCredential; // Cast to specific type
      if (credential && credential.accessToken) {
        // The onAuthStateChanged listener will handle setting the user and app-level token.
        // We can store the google-specific one if we need it for gmail, etc.
        console.log("Google Sign-In successful, access token for Google services obtained.");
      } else {
        console.error("Google Sign-In succeeded but no access token found in credential.");
      }
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error);
      // Handle specific errors (e.g., popup_closed_by_user, network_error)
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup
      }
    } finally {
      // Let onAuthStateChanged handle the final loading state
    }
  };

  const signOutGoogle = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // User and token state will be cleared by onAuthStateChanged listener
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // Let onAuthStateChanged handle the final loading state
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, signInWithGoogleAndGetGmailToken, signOutGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
