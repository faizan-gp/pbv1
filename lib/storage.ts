import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProductImage(file: File, folder: string = "misc", productName?: string): Promise<string> {
    const timestamp = Date.now();
    // Clean filename to avoid issues
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");

    let storagePath;
    if (productName && productName.trim()) {
        const slug = productName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        storagePath = `products/${slug}/${folder}/${timestamp}_${cleanName}`;
    } else {
        storagePath = `products/_drafts/${folder}/${timestamp}_${cleanName}`;
    }

    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

export async function uploadBase64Image(base64String: string, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    // Remove header if present (e.g. "data:image/png;base64,")
    const uploadRef = await import("firebase/storage").then(m => m.uploadString(storageRef, base64String, 'data_url'));
    return await getDownloadURL(storageRef);
}

export async function uploadProductBlob(blob: Blob, filename: string, folder: string, productName?: string, productId?: string): Promise<string> {
    const timestamp = Date.now();
    // Clean filename
    const cleanName = filename.replace(/[^a-zA-Z0-9.]/g, "-");

    let storagePath;
    if (productId) {
        // ID-based path (preferred for deep clones)
        storagePath = `products/${productId}/${folder}/${timestamp}_${cleanName}`;
    } else if (productName && productName.trim()) {
        const slug = productName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        storagePath = `products/${slug}/${folder}/${timestamp}_${cleanName}`;
    } else {
        storagePath = `products/_drafts/${folder}/${timestamp}_${cleanName}`;
    }

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
}
