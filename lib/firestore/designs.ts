import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";

export interface Design {
    id: string; // Firestore ID
    userId: string;
    productId: string;
    name: string;
    previewImage: string;
    config: any; // Fabric.js config
    createdAt: Date;
    updatedAt: Date;
}

export const DESIGNS_COLLECTION = "designs";

export async function createDesign(designData: Omit<Design, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const designsRef = collection(db, DESIGNS_COLLECTION);
    const now = new Date();

    const docRef = await addDoc(designsRef, {
        ...designData,
        createdAt: now,
        updatedAt: now
    });

    return docRef.id;
}

export async function getUserDesigns(userId: string): Promise<Design[]> {
    const designsRef = collection(db, DESIGNS_COLLECTION);
    const q = query(designsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Design;
    });
}

export async function getDesignById(designId: string): Promise<Design | null> {
    const designRef = doc(db, DESIGNS_COLLECTION, designId);
    const snapshot = await getDoc(designRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Design;
    }

    return null;
}
