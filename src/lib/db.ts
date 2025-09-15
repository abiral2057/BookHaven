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
  author: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export interface Category {
    id: string;
    name: string;
    description: string;
    createdAt: Timestamp;
}

export type CategoryInput = Omit<Category, "id" | "createdAt">;


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

export const addCategory = async (category: CategoryInput): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "categories"), {
            ...category,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add category");
    }
};

export const getCategories = async (): Promise<Category[]> => {
    try {
        const q = query(collection(db, "categories"));
        const querySnapshot = await getDocs(q);
        const categories: Category[] = [];
        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() } as Category);
        });
        return categories;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Could not get categories");
    }
}
