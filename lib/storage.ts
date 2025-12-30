import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProductImage(file: File, folder: string = "misc"): Promise<string> {
    const timestamp = Date.now();
    // Clean filename to avoid issues
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const storagePath = `products/${folder}/${timestamp}_${cleanName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}
