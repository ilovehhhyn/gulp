import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config loaded:", {
  apiKey: firebaseConfig.apiKey ? "✓" : "✗",
  authDomain: firebaseConfig.authDomain ? "✓" : "✗",
  projectId: firebaseConfig.projectId ? "✓" : "✗",
  storageBucket: firebaseConfig.storageBucket ? "✓" : "✗",
  messagingSenderId: firebaseConfig.messagingSenderId ? "✓" : "✗",
  appId: firebaseConfig.appId ? "✓" : "✗",
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized successfully");

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage (for drawings)
export const storage = getStorage(app);

export default app;
