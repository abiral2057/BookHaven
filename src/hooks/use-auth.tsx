"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithUsername: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;
const ADMIN_USERNAME = "abiral";
const ADMIN_PASSWORD = "abiral";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [simpleAdmin, setSimpleAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUser(user);
      setLoading(false);
    });

    // Check session storage for simple admin
    const sessionAdmin = sessionStorage.getItem('isAdminLoggedIn');
    if (sessionAdmin === 'true') {
        setSimpleAdmin(true);
    }


    return () => unsubscribe();
  }, []);

  const isAdmin = (user && ADMIN_UID && user.uid === ADMIN_UID) || simpleAdmin;

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle state updates.
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      throw error;
    }
  };

  const signInWithUsername = async (username: string, pass: string): Promise<boolean> => {
    if (username === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        setSimpleAdmin(true);
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        return true;
    }
    return false;
  }

  const logout = async () => {
    try {
      await signOut(auth);
      setSimpleAdmin(false);
      sessionStorage.removeItem('isAdminLoggedIn');
      // After logout, redirect to home.
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, isAdmin, signInWithGoogle, signInWithUsername, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
