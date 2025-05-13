// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore"; // Firestore is no longer used directly here
import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth"; // Uncomment if using Firebase Auth

// Your web app's Firebase configuration
// IMPORTANT: These should be set in your environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  if (Object.values(firebaseConfig).some(value => !value && value !== undefined)) { // Allow undefined for optional measurementId
    console.warn("Firebase config is missing some values. Features relying on Firebase might not work.");
    // Provide a dummy app if config is incomplete, to prevent crashes if `storage` is called.
    app = { options: {} } as any; 
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

// const db = getFirestore(app); // Firestore instance removed
let storage;
try {
  storage = getStorage(app);
} catch (e) {
  console.warn("Could not initialize Firebase Storage. Document uploads/downloads will fail.", e);
  // Provide a dummy storage if initialization fails
  storage = {
    ref: () => ({}), 
    uploadBytes: () => Promise.reject(new Error("Firebase Storage not initialized.")),
    getDownloadURL: () => Promise.reject(new Error("Firebase Storage not initialized.")),
    deleteObject: () => Promise.reject(new Error("Firebase Storage not initialized.")),
  } as any;
}

// const auth = getAuth(app); // Uncomment if using Firebase Auth

export { app, storage /*, auth */ }; // db removed from export
