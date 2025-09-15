"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
