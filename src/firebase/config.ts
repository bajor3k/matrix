
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (from Firebase Console)
export const firebaseConfig = {
  apiKey: "AIzaSyCPR9Oo096XWAjWsJmV1YTilsljf8aIsdw",
  authDomain: "matrix-y2jfw.firebaseapp.com",
  projectId: "matrix-y2jfw",
  storageBucket: "matrix-y2jfw.appspot.com",
  messagingSenderId: "222012964348",
  appId: "1:222012964348:web:0941586f00d763acfd8679"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleAuthProvider = new GoogleAuthProvider();

// Add necessary Gmail API scopes (if you need Gmail features)
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
// For full access, consider: googleAuthProvider.addScope('https://mail.google.com/');

export { app, auth, storage, db, googleAuthProvider };
