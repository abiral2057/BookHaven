
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '@/lib/db';
import { useToast } from './use-toast';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  lastOrderItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setLastOrderItemsAndClearCart: (items: CartItem[]) => void;
  cartTotal: number;
  cartCount: number;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Lazy initialization from localStorage
    try {
      const savedCart = localStorage.getItem('bookhaven-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedLastOrder = localStorage.getItem('bookhaven-last-order');
      if (savedLastOrder) {
        setLastOrderItems(JSON.parse(savedLastOrder));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
    }
  }, []);

  useEffect(() => {
    // Persist cart to localStorage
    if(isMounted) {
      try {
        localStorage.setItem('bookhaven-cart', JSON.stringify(cartItems));
        // Also save last order items to persist them across page reloads
        localStorage.setItem('bookhaven-last-order', JSON.stringify(lastOrderItems));
      } catch (error) {
        console.error('Failed to save to localStorage', error);
      }
    }
  }, [cartItems, lastOrderItems, isMounted]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          // Increase quantity if item already exists
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({
            variant: "destructive",
            title: "Stock Limit Reached",
            description: `You cannot add more of "${product.name}".`,
          });
          return prevItems;
        }
      }
      // Add new item with quantity 1
      if (product.stock > 0) {
        return [...prevItems, { ...product, quantity: 1 }];
      } else {
         toast({
            variant: "destructive",
            title: "Out of Stock",
            description: `"${product.name}" is currently out of stock.`,
          });
        return prevItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
           if (quantity > item.stock) {
              toast({
                variant: "destructive",
                title: "Stock Limit Reached",
                description: `Only ${item.stock} copies of "${item.name}" are available.`,
              });
              return { ...item, quantity: item.stock };
            }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const setLastOrderItemsAndClearCart = (items: CartItem[]) => {
    setLastOrderItems(items);
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    lastOrderItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setLastOrderItemsAndClearCart,
    cartTotal,
    cartCount,
    isMounted,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
