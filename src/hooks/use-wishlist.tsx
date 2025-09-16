
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '@/lib/db';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const savedWishlist = localStorage.getItem('bookhaven-wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Failed to parse wishlist from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookhaven-wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage', error);
    }
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist(prevWishlist => {
      if (!prevWishlist.some(item => item.id === product.id)) {
        return [...prevWishlist, product];
      }
      return prevWishlist;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
