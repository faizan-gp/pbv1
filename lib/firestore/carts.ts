
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { CartItem } from '@/app/context/CartContext';

const CARTS_COLLECTION = 'carts';

export interface CartData {
    userId: string;
    userEmail?: string;
    items: CartItem[];
    updatedAt: string; // ISO string
    total: number;
    itemCount: number;
    status: 'active' | 'completed' | 'abandoned';
}

export async function syncCartToFirestore(userId: string, email: string | undefined, items: CartItem[], total: number) {
    if (!userId) return;

    const cartRef = doc(db, CARTS_COLLECTION, userId); // Using userId as docId ensures one cart per user
    const cartData: CartData = {
        userId,
        userEmail: email,
        items,
        updatedAt: new Date().toISOString(),
        total,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
        status: 'active'
    };

    await setDoc(cartRef, cartData, { merge: true });
}

export async function getAbandonedCarts() {
    const cartsRef = collection(db, CARTS_COLLECTION);
    // Get all active carts. "Abandoned" is just an active cart that hasn't been touched in a while.
    // For this admin view, we just show all "active" carts.
    const q = query(cartsRef, where('status', '==', 'active'), orderBy('updatedAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as CartData);
}
