"use client";

import {
  collection,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add product");
  }
};
