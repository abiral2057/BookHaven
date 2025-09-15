"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableNetwork, disableNetwork } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-1002872063-5a675",
  appId: "1:198536334292:web:6e90653055d105669be441",
  storageBucket: "studio-1002872063-5a675.firebasestorage.app",
  apiKey: "AIzaSyCq5ZcA70bvcjAxzRRYvAR0rYG-r6x3mic",
  authDomain: "studio-1002872063-5a675.firebaseapp.com",
  messagingSenderId: "198536334292"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// A function to check if the database is online
export const isDbReady = async (): Promise<boolean> => {
  try {
    // try to enable the network to see if it resolves
    await enableNetwork(db);
    return true;
  } catch (e) {
    try {
        // if that fails, try to disable and re-enable
        await disableNetwork(db);
        await enableNetwork(db);
        return true;
    } catch (error) {
        console.error("Firebase network error:", error);
        return false;
    }
  }
};

export { app, auth, db };
