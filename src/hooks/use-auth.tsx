
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export interface SignUpWithEmailCredentials {
    email: string;
    passwordOne: string;
    displayName: string;
}

export interface SignInWithEmailCredentials {
    email: string;
    passwordOne: string;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (credentials: SignUpWithEmailCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  signInWithEmail: (credentials: SignInWithEmailCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        // Check for admin custom claim
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle user state updates and routing.
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error("Error signing in with Google: ", error);
    }
  };

  const signUpWithEmail = async ({ email, passwordOne, displayName }: SignUpWithEmailCredentials) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, passwordOne);
        await updateProfile(userCredential.user, { displayName });
        // The onAuthStateChanged listener will handle the user state update.
        return { success: true };
    } catch (error) {
        return { success: false, error: error as AuthError };
    }
  };

  const signInWithEmail = async ({ email, passwordOne }: SignInWithEmailCredentials) => {
     try {
        await signInWithEmailAndPassword(auth, email, passwordOne);
        // The onAuthStateChanged listener will handle the user state update.
        return { success: true };
    } catch (error) {
        return { success: false, error: error as AuthError };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // After logout, redirect to home.
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, isAdmin, signInWithGoogle, signUpWithEmail, signInWithEmail, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
