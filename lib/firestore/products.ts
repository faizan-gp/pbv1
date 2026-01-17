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
    printifyVariantIds?: number[];
}

export interface IProductFeature {
    title: string;
    description: string;
    image?: string;
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
    price?: number;
    shippingCost?: number;
    shippingTime?: string;
    productionTime?: string;
    bulletPoints?: string[];
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
    tags?: string[]; // SEO Tags (e.g. category:mens-clothing, material:cotton)
    faq?: { question: string; answer: string }[];
    updatedAt?: string; // ISO Date string for SEO lastMod
    printifyBlueprintId?: number;
    printifyProviderId?: number;
    printifyCameras?: {
        id: number;
        label: string;
        position: string;
        is_default: number;
        camera_id: number;
    }[];
}

export const PRODUCTS_COLLECTION = "products";

export async function getAllProducts(): Promise<Product[]> {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    const snapshot = await getDoc(productRef);

    if (snapshot.exists()) {
        const data = snapshot.data() as Product;
        // Temporary: Inject Printify IDs for relevant products if missing
        if (!data.printifyBlueprintId && (data.id.includes('tee') || data.id.includes('shirt') || data.id === 'comfort-colors-1717')) {
            data.printifyBlueprintId = 706; // Comfort Colors / Bella Canvas Blueprint
            data.printifyProviderId = 25;   // Monster Digital (Better Variant Support)
        }
        return data;
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

export async function getProductsByCategory(category: string, limitCount: number = 4, excludeId?: string): Promise<Product[]> {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where("category", "==", category));

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => doc.data() as Product);

    // Filter out excluded ID and limit results (Firestore limit() doesn't work well with excluding specific IDs in client SDK without complex indexing sometimes, doing in-memory for small datasets is fine)
    // For larger datasets, we'd want to use proper indices and limits.
    const filtered = products.filter(p => p.id !== excludeId);
    return filtered.slice(0, limitCount);
}
