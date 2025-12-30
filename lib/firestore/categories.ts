import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp, writeBatch, doc } from "firebase/firestore";

export interface Category {
    id: string;
    name: string;
    subcategories: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export const CATEGORIES_COLLECTION = "categories";

export async function getAllCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate()
        } as Category;
    });
}

export async function createCategory(categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const now = new Date();
    const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        createdAt: now,
        updatedAt: now
    });
    return docRef.id;
}

export async function seedCategoriesBatch(categories: Omit<Category, "id" | "createdAt" | "updatedAt">[]): Promise<void> {
    const batch = writeBatch(db);
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const now = new Date();

    categories.forEach(cat => {
        const docRef = doc(categoriesRef); // Auto-ID
        batch.set(docRef, {
            ...cat,
            createdAt: now,
            updatedAt: now
        });
    });

    await batch.commit();
}
