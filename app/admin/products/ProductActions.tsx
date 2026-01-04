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

    const handleDuplicate = async () => {
        const newId = window.prompt("Enter a new ID for the duplicate product:", `${product.id}-2`);

        if (!newId || newId === product.id) return;

        if (!confirm(`Are you sure you want to duplicate "${product.name}" with ID "${newId}"?`)) return;

        try {
            setIsDuplicating(true);

            const newProduct: Product = {
                ...product,
                id: newId,
                name: `${product.name} (Copy)`,
                trending: false, // Reset trending status
            };

            await createProduct(newProduct);

            router.refresh(); // Refresh the server component to show the new product
            alert("Product duplicated successfully!");
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
