// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
<<<<<<< HEAD
<<<<<<< HEAD
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "demo-measurement-id"
=======
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
>>>>>>> 6e29199 (// Import the functions you need from the SDKs you need)
=======
  apiKey: "AIzaSyBZcUVARYZ_f57ht9cyDlPnnYxclnl7k3o",
  authDomain: "safaa-boutique.firebaseapp.com",
  projectId: "safaa-boutique",
  storageBucket: "safaa-boutique.appspot.com",
  messagingSenderId: "809977021637",
  appId: "1:809977021637:web:8c7854d538f4128aa5dcac"
>>>>>>> 30d55bb (gcloud storage buckets update gs://safaa-boutique.firebasestorage.app --)
};

// Initialize Firebase only if we have valid configuration
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  if (app) {
    isSupported().then(yes => {
      if (yes && app) {
        analytics = getAnalytics(app);
      }
    });
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed, using fallback mode:', error);
  // Create mock objects for fallback
  app = null;
  analytics = null;
  db = null;
  storage = null;
}

export { app, analytics, db, storage };
