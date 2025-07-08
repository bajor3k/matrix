import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (from Firebase Console)
export const firebaseConfig = {
  apiKey: "AIzaSyCPR9Oo096XWAjWsJmV1YTilsljf8aIsdw",
  authDomain: "matrix-y2jfw.firebaseapp.com",
  projectId: "matrix-y2jfw",
  storageBucket: "matrix-y2jfw.appspot.com", // <-- FIXED typo here: should be .appspot.com
  messagingSenderId: "222012964348",
  appId: "1:222012964348:web:0941586f00d763acfd8679"
  // measurementId: "G-XXXXXXXXXX" // Optional, can add if needed
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

// Add necessary Gmail API scopes (if you need Gmail features)
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
// For full access, consider: googleAuthProvider.addScope('https://mail.google.com/');

export { app, auth, storage, googleAuthProvider };
