import {
  collection,
  addDoc,
  serverTimestamp,
  type Timestamp,
  getDocs,
  query,
  doc,
  setDoc,
  getDoc,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CartItem } from "@/hooks/use-cart";

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

export interface Customer {
  id: string; // email address
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  firstOrderAt: Date;
}

export type CustomerInput = Omit<Customer, "id" | "firstOrderAt">;

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  items: CartItem[];
  total: number;
  status: "Pending" | "Shipped" | "Delivered";
  createdAt: Date;
}


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

export const getProducts = async (count?: number): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const q = count 
      ? query(productsRef, orderBy("createdAt", "desc"), limit(count))
      : query(productsRef, orderBy("createdAt", "desc"));
      
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
        const q = query(collection(db, "categories"), orderBy("name"));
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

export const addCustomer = async (customer: CustomerInput): Promise<string> => {
    const customerRef = doc(db, "customers", customer.email);
    const docSnap = await getDoc(customerRef);

    if (!docSnap.exists()) {
        // New customer, add them with firstOrderAt
        try {
            await setDoc(customerRef, {
                ...customer,
                firstOrderAt: serverTimestamp()
            });
            return customer.email;
        } catch (e) {
            console.error("Error adding customer: ", e);
            throw new Error("Could not add customer");
        }
    } else {
        // Existing customer, no need to update
        return customer.email;
    }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, "customers"), orderBy("firstOrderAt", "desc"));
    const querySnapshot = await getDocs(q);
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const firstOrderAt = (data.firstOrderAt as Timestamp)?.toDate ? (data.firstOrderAt as Timestamp).toDate() : new Date();
      customers.push({ 
          id: doc.id, 
          ...data,
          firstOrderAt: firstOrderAt
      } as Customer);
    });
    return customers;
  } catch (e) {
    console.error("Error getting customers: ", e);
    throw new Error("Could not get customers");
  }
};


export const addOrder = async (order: Omit<Order, "id" | "createdAt" | "status">): Promise<string> => {
    try {
        // First, ensure the customer exists
        await addCustomer({
            name: order.customer.name,
            email: order.customer.email,
            // These are placeholders for now. We can expand this later.
            address: 'N/A', 
            city: 'N/A',
            postalCode: 'N/A'
        });

        const docRef = await addDoc(collection(db, "orders"), {
            ...order,
            status: "Pending",
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding order: ", e);
        throw new Error("Could not add order");
    }
}

export const getOrders = async (count?: number): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        const q = count 
          ? query(ordersRef, orderBy("createdAt", "desc"), limit(count))
          : query(ordersRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date();
            orders.push({ 
                id: doc.id, 
                ...data,
                createdAt: createdAt
            } as Order);
        });
        return orders;
    } catch (e) {
        console.error("Error getting orders: ", e);
        throw new Error("Could not get orders");
    }
}
