"use client";

import {
  collection,
  addDoc,
  serverTimestamp,
  type Timestamp,
  getDocs,
  query,
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

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export const addProduct = async (product: ProductInput): Promise<string> => {
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

export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Could not get products");
  }
}