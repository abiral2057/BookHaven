
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
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
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
  address?: string;
  city?: string;
  postalCode?: string;
  firstOrderAt: Date;
}

export type CustomerInput = Omit<Customer, "id" | "firstOrderAt">;

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
  };
  items: CartItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Shipping" | "Delivered" | "Refunded";
  createdAt: Date;
  userId?: string; // To associate order with a user
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

export const updateProduct = async (id: string, product: ProductInput): Promise<void> => {
    try {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, {
            ...product,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Could not update product");
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    try {
        const productRef = doc(db, "products", id);
        await deleteDoc(productRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete product");
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

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, "products", id);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    throw new Error("Could not get product");
  }
};

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

export const addCustomer = async (customer: Omit<CustomerInput, 'name' | 'email'> & { name: string; email: string; }): Promise<string> => {
    const customerRef = doc(db, "customers", customer.email);
    const docSnap = await getDoc(customerRef);

    const customerData = {
        name: customer.name,
        email: customer.email,
        address: customer.address || null,
        city: customer.city || null,
        postalCode: customer.postalCode || null,
    };

    if (!docSnap.exists()) {
        // New customer, add them with firstOrderAt
        try {
            await setDoc(customerRef, {
                ...customerData,
                firstOrderAt: serverTimestamp()
            });
            return customer.email;
        } catch (e) {
            console.error("Error adding customer: ", e);
            throw new Error("Could not add customer");
        }
    } else {
       // Existing customer, update their address info
       try {
         await setDoc(customerRef, customerData , { merge: true });
         return customer.email;
       } catch (e) {
          console.error("Error updating customer: ", e);
          throw new Error("Could not update customer");
       }
    }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, "customers"), orderBy("firstOrderAt", "desc"));
    const querySnapshot = await getDocs(q);
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const firstOrderAtRaw = data.firstOrderAt as Timestamp | null;
      customers.push({ 
          id: doc.id, 
          ...data,
          firstOrderAt: firstOrderAtRaw?.toDate() ?? new Date(),
      } as Customer);
    });
    return customers;
  } catch (e) {
    console.error("Error getting customers: ", e);
    throw new Error("Could not get customers");
  }
};


export const addOrder = async (order: Omit<Order, "id" | "createdAt" | "status" >): Promise<string> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User is not authenticated. Cannot place order.");
    }

    try {
        // First, ensure the customer exists and has up-to-date info
        await addCustomer({
            name: order.customer.name,
            email: order.customer.email,
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            postalCode: order.shippingAddress.postalCode,
        });

        const docRef = await addDoc(collection(db, "orders"), {
            ...order,
            userId: user.uid,
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
            const createdAtRaw = data.createdAt as Timestamp | null;
            orders.push({ 
                id: doc.id, 
                ...data,
                createdAt: createdAtRaw?.toDate() ?? new Date()
            } as Order);
        });
        return orders;
    } catch (e) {
        console.error("Error getting orders: ", e);
        throw new Error("Could not get orders");
    }
}

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAtRaw = data.createdAt as Timestamp | null;
            orders.push({ 
                id: doc.id, 
                ...data,
                createdAt: createdAtRaw?.toDate() ?? new Date()
            } as Order);
        });
        return orders;
    } catch (e) {
        console.error("Error getting user orders: ", e);
        throw new Error("Could not get user orders");
    }
}


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status });
    } catch (e) {
        console.error("Error updating order status: ", e);
        throw new Error("Could not update order status");
    }
};
