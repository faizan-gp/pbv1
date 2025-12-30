import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp, collection, getDocs, query, where, updateDoc } from "firebase/firestore";

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export const USERS_COLLECTION = "users";

export async function createUser(id: string, userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, id);
    const now = new Date();
    await setDoc(userRef, {
        ...userData,
        id,
        createdAt: now,
        updatedAt: now
    });
}

export async function getUserById(id: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            id: userSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as User;
    }

    return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate()
    } as User;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
    });
}

export async function getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as User;
    });
}
