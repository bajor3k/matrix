
// src/lib/firebase/config.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN_PLACEHOLDER",
  projectId: "YOUR_FIREBASE_PROJECT_ID_PLACEHOLDER",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET_PLACEHOLDER",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "YOUR_FIREBASE_APP_ID_PLACEHOLDER",
  // measurementId: "YOUR_FIREBASE_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const storage = getStorage(app);
const googleAuthProvider = new GoogleAuthProvider();

// Add necessary Gmail API scopes
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
// For full access, consider: googleAuthProvider.addScope('https://mail.google.com/');

export { app, auth, storage, googleAuthProvider };
