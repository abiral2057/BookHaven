import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableNetwork, disableNetwork, doc, setDoc, deleteDoc } from "firebase/firestore";

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

if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== "undefined") {
  app = getApp();
} else {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}


auth = getAuth(app);
db = getFirestore(app);

// A function to check if the database is online and writable
export const checkDbConnection = async (): Promise<{ ready: boolean; error?: string }> => {
  try {
    await enableNetwork(db);
  } catch (e) {
    try {
      await disableNetwork(db);
      await enableNetwork(db);
    } catch (networkError) {
      console.error("Firebase network error:", networkError);
      return { ready: false, error: "Network error: Could not connect to Firebase." };
    }
  }

  // Attempt a test write to verify security rules, but only if user is logged in.
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const testDocRef = doc(db, `_test_writes/${currentUser.uid}`);
      await setDoc(testDocRef, { timestamp: new Date() });
      await deleteDoc(testDocRef);
    } catch (e: any) {
        console.error("Firestore security rule error:", e);
        if (e.code === 'permission-denied') {
            return { ready: false, error: "Permission Denied: Please check your Firestore security rules to allow writes." };
        }
        return { ready: false, error: "A database error occurred. Check console for details." };
    }
  }
  
  return { ready: true };
};

/**
 * @deprecated Use checkDbConnection instead for a more robust check.
 */
export const isDbReady = async (): Promise<boolean> => {
  const { ready } = await checkDbConnection();
  return ready;
}


export { app, auth, db };
