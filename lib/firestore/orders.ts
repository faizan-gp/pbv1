import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, updateDoc, Timestamp } from "firebase/firestore";

export interface OrderItem {
    productId: string;
    designId?: string;
    quantity: number;
    price: number;
    configSnapshot?: any;
    previewSnapshot?: string;
}

export interface Order {
    id: string; // Firestore Auto-ID
    userId?: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingDetails: {
        name: string;
        email: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export const ORDERS_COLLECTION = "orders";

export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const now = new Date();

    const docRef = await addDoc(ordersRef, {
        ...orderData,
        createdAt: now,
        updatedAt: now
    });

    return docRef.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Order;
    });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const snapshot = await getDoc(orderRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Order;
    }
    return null;
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date()
    });
}

export async function getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Order;
    });
}
