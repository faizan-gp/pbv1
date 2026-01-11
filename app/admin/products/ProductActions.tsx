"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct, Product } from "@/lib/firestore/products";

interface ProductActionsProps {
    product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const router = useRouter();
    const [isDuplicating, setIsDuplicating] = useState(false);

    const cloneAsset = async (url: string, newId: string, folder: string, filenamePrefix: string = 'clone'): Promise<string> => {
        if (!url || !url.startsWith('http')) return url; // Handle empty or non-remote URLs
        try {
            // Use Server Action to fetch image (Bypass CORS)
            const { fetchImageAsBase64 } = await import("@/app/actions/fetch-image");
            const base64Data = await fetchImageAsBase64(url);

            if (!base64Data) {
                console.error(`Failed to fetch image via server action: ${url}`);
                return url; // Fallback
            }

            // Lazy import storage
            const { uploadBase64Image } = await import("@/lib/storage");

            // Construct path
            const timestamp = Date.now();
            // Guess extension from base64 header
            const ext = base64Data.substring(base64Data.indexOf('/') + 1, base64Data.indexOf(';'));
            const filename = `${filenamePrefix}.${ext}`;
            const storagePath = `products/${newId}/${folder}/${timestamp}_${filename}`;

            return await uploadBase64Image(base64Data, storagePath);
        } catch (e) {
            console.error(`Failed to clone asset: ${url}`, e);
            return url; // Fallback to original if clone fails
        }
    };

    const handleDuplicate = async () => {
        const newId = window.prompt("Enter a new ID for the duplicate product:", `${product.id}-2`);

        if (!newId || newId === product.id) return;

        if (!confirm(`Are you sure you want to duplicate "${product.name}" with ID "${newId}"? This will Deep Clone images (slower).`)) return;

        try {
            setIsDuplicating(true);

            // 1. Clone Main Image
            const newMainImage = await cloneAsset(product.image, newId, 'main', 'main-image');

            // 2. Clone Listing Images
            const newListingImages = product.listingImages ? await Promise.all(product.listingImages.map(async (img, idx) => {
                const newUrl = await cloneAsset(img.url, newId, 'listing', `listing-${idx}-${img.color}`);
                return { ...img, url: newUrl };
            })) : [];

            // 3. Clone Color Variant Images
            const newColors = await Promise.all(product.colors.map(async (color) => {
                const newImages: Record<string, string> = {};
                for (const [viewId, url] of Object.entries(color.images)) {
                    newImages[viewId] = await cloneAsset(url, newId, 'colors', `${color.name}-${viewId}`);
                }
                return { ...color, images: newImages };
            }));

            // 4. Clone Feature Images
            const newFeatures = product.features ? await Promise.all(product.features.map(async (feat, idx) => {
                if (!feat.image) return feat;
                const newUrl = await cloneAsset(feat.image, newId, 'features', `feature-${idx}`);
                return { ...feat, image: newUrl };
            })) : [];


            const newProduct: Product = {
                ...product,
                id: newId,
                name: `${product.name} (Copy)`,
                trending: false, // Reset trending status
                image: newMainImage,
                listingImages: newListingImages,
                colors: newColors,
                features: newFeatures,
                updatedAt: new Date().toISOString()
            };

            await createProduct(newProduct);

            router.refresh(); // Refresh the server component to show the new product
            alert("Product duplicated successfully (Deep Clone complete)!");
        } catch (error) {
            console.error("Failed to duplicate product:", error);
            alert("Failed to duplicate product. Please check the console for details.");
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Duplicate Product"
        >
            {isDuplicating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Copy className="h-3 w-3" />
            )}
            <span className="sr-only lg:not-sr-only">Duplicate</span>
        </button>
    );
}
