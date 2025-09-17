
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
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { CartItem } from "@/hooks/use-cart";
import { sendOrderConfirmationToCustomer, sendNewOrderNotificationToAdmin } from "./email";


export interface Product {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isbn?: string;
  condition: "New" | "Used";
  createdAt: string;
  updatedAt: string;
  reviewCount?: number;
  averageRating?: number;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "reviewCount" | "averageRating" >;

export interface Category {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export type CategoryInput = Omit<Category, "id" | "createdAt">;

export interface Customer {
  id: string; // email address
  name: string;
  email: string;
  address?: string;
  city?: string;
  postalCode?: string;
  firstOrderAt: string;
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
  createdAt: string;
  userId?: string; // To associate order with a user
  paymentMethod: "COD" | "eSewa" | "Khalti";
  transactionId?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type ReviewInput = Omit<Review, "id" | "createdAt">;


export const addProduct = async (product: ProductInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      reviewCount: 0,
      averageRating: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add product");
  }
};

export const updateProduct = async (id: string, product: Partial<ProductInput>): Promise<void> => {
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

const docToProduct = (doc: any): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Product;
};


export const getProducts = async (count?: number): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const q = count 
      ? query(productsRef, orderBy("createdAt", "desc"), limit(count))
      : query(productsRef, orderBy("createdAt", "desc"));
      
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToProduct);
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
      return docToProduct(docSnap);
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

const docToCategory = (doc: any): Category => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Category;
}

export const getCategories = async (): Promise<Category[]> => {
    try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToCategory);
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

const docToCustomer = (doc: any): Customer => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        firstOrderAt: (data.firstOrderAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Customer;
}

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, "customers"), orderBy("firstOrderAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToCustomer);
  } catch (e) {
    console.error("Error getting customers: ", e);
    throw new Error("Could not get customers");
  }
};

const docToOrder = (doc: any): Order => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Order;
}


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
        
        // After order is created, send emails
        const newOrderData = (await getDoc(docRef)).data();
        const newOrder = { 
            id: docRef.id,
            ...newOrderData,
            createdAt: (newOrderData?.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Order;

        await sendOrderConfirmationToCustomer(newOrder);
        await sendNewOrderNotificationToAdmin(newOrder);

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
        return querySnapshot.docs.map(docToOrder);
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
        return querySnapshot.docs.map(docToOrder);
    } catch (e) {
        console.error("Error getting user orders: ", e);
        throw new Error("Could not get user orders");
    }
}


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    const orderRef = doc(db, "orders", orderId);
    try {
        if (status === "Delivered") {
            // Use a transaction to ensure atomicity
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) {
                    throw "Order does not exist!";
                }

                const orderData = orderDoc.data() as Order;

                // Decrease stock for each item in the order
                for (const item of orderData.items) {
                    const productRef = doc(db, "products", item.id);
                    const productDoc = await transaction.get(productRef);

                    if (productDoc.exists()) {
                        const currentStock = productDoc.data().stock;
                        const newStock = Math.max(0, currentStock - item.quantity);
                        transaction.update(productRef, { stock: newStock });
                    }
                }

                // Finally, update the order status
                transaction.update(orderRef, { status });
            });
        } else {
            // If status is not 'Delivered', just update the status
            await updateDoc(orderRef, { status });
        }
    } catch (e) {
        console.error("Error updating order status: ", e);
        throw new Error("Could not update order status");
    }
};

export const getTopSellingProducts = async (count: number): Promise<Product[]> => {
    try {
        const orders = await getOrders();
        const productSales: { [productId: string]: number } = {};

        orders.forEach(order => {
            if (order.status === 'Delivered') { // Only count sales from delivered orders
                order.items.forEach(item => {
                    productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
                });
            }
        });

        const sortedProductIds = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]);
        const topProductIds = sortedProductIds.slice(0, count);

        if (topProductIds.length === 0) {
            return [];
        }

        // Fetch product details for the top selling products
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("__name__", "in", topProductIds));
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = querySnapshot.docs.map(docToProduct);

        // Sort the fetched products according to their sales rank
        const sortedProducts = products.sort((a, b) => {
            const salesA = productSales[a.id] || 0;
            const salesB = productSales[b.id] || 0;
            return salesB - salesA;
        });

        return sortedProducts;
    } catch (e) {
        console.error("Error getting top selling products: ", e);
        throw new Error("Could not get top selling products");
    }
};

const docToReview = (doc: any): Review => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Review;
}

export const addReview = async (review: ReviewInput): Promise<string> => {
  const user = auth.currentUser;
  if (!user || user.uid !== review.userId) {
    throw new Error("User is not authenticated to add this review.");
  }
  const reviewRef = collection(db, "reviews");
  const productRef = doc(db, "products", review.productId);

  try {
    const newReviewRef = doc(reviewRef); // Create a new doc ref for the review

    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw "Product not found!";
      }

      // Add the new review
      transaction.set(newReviewRef, {
        ...review,
        createdAt: serverTimestamp(),
      });

      // Update the product's review aggregates
      const productData = productDoc.data();
      const currentReviewCount = productData.reviewCount || 0;
      const currentAverageRating = productData.averageRating || 0;

      const newReviewCount = currentReviewCount + 1;
      const newAverageRating =
        (currentAverageRating * currentReviewCount + review.rating) / newReviewCount;

      transaction.update(productRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating,
        updatedAt: serverTimestamp(),
      });
    });

    return newReviewRef.id;
  } catch (e) {
    console.error("Error adding review and updating product: ", e);
    throw new Error("Could not add review");
  }
};


export const getReviewsByProductId = async (productId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("productId", "==", productId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToReview);
  } catch (e) {
    console.error("Error getting reviews: ", e);
    throw new Error("Could not get reviews for product");
  }
};

// Function to check if an order with a given transaction_uuid already exists
export const getOrderByTransactionId = async (transactionId: string): Promise<Order | null> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('transactionId', '==', transactionId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return docToOrder(doc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by transaction ID:', error);
    throw new Error('Could not verify order transaction.');
  }
};
