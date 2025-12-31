import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPR90oO96XWAjWsJmV1YTilsljf8aIsdw",
  authDomain: "matrix-y2jfw.firebaseapp.com",
  projectId: "matrix-y2jfw",
  storageBucket: "matrix-y2jfw.firebasestorage.app",
  messagingSenderId: "222012964348",
  appId: "1:222012964348:web:0941586f00d763acfd8679"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };