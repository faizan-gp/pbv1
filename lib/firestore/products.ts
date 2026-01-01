import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";

export interface IPreviewConfig {
    id: string;
    name: string;
    editorZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previewZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    displacementMap?: string;
    shadowMap?: string;
    editorCutout?: string;
    cssTransform?: string;
}

export interface IProductColor {
    name: string;
    hex: string;
    images: Record<string, string>;
}

export interface IProductFeature {
    title: string;
    description: string;
    icon: string;
}

export interface Product {
    id: string; // The application logic ID (e.g. 't-shirt-standard')
    name: string;
    category: string;
    trending?: boolean;
    image: string;
    listingImages?: {
        url: string;
        color: string;
        isThumbnail: boolean;
    }[];
    subcategory?: string;
    shortDescription?: string;
    fullDescription?: string;
    features?: IProductFeature[];
    careInstructions?: string[];
    sizeGuide?: {
        imperial: any[];
        metric: any[];
    };
    canvasSize: number;
    colors: IProductColor[];
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previews: IPreviewConfig[];
}

export const PRODUCTS_COLLECTION = "products";

export async function getAllProducts(): Promise<Product[]> {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => doc.data() as Product);
}

export async function getProductById(id: string): Promise<Product | null> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    const snapshot = await getDoc(productRef);

    if (snapshot.exists()) {
        return snapshot.data() as Product;
    }
    return null;
}

export async function createProduct(product: Product): Promise<void> {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(productRef, product);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(productRef, updates, { merge: true });
}

export async function seedProductsBatch(products: Product[]): Promise<void> {
    const batch = writeBatch(db);

    products.forEach(product => {
        const ref = doc(db, PRODUCTS_COLLECTION, product.id);
        batch.set(ref, product);
    });

    await batch.commit();
}

export async function deleteProduct(id: string): Promise<void> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
}
