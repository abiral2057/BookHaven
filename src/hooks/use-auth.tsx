"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin UID for simplicity. In a real app, this should be managed in a database.
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);
      
      if(user) {
        // In a real app, you would get a custom claim or check a 'roles' collection in Firestore
        const tokenResult = await user.getIdTokenResult();
        // For this demo, we'll check a custom claim or an env variable
        if (tokenResult.claims.admin === true || (ADMIN_UID && user.uid === ADMIN_UID)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
       const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.admin === true || (ADMIN_UID && user.uid === ADMIN_UID)) {
          router.push('/admin/dashboard');
      } else {
          router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      // You might want to show a toast notification here
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page after logout, if on a protected route
      if(pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
          router.push('/');
      }
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, isAdmin, signInWithGoogle, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
