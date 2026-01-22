"use client";

import Link from "next/link";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { createProduct, Product } from "@/lib/firestore/products";
import { useRouter } from "next/navigation";

export default function ProductHeaderActions() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const router = useRouter();

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            alert("Please select a valid JSON file.");
            return;
        }

        try {
            setIsImporting(true);
            const text = await file.text();
            const json = JSON.parse(text);

            // Basic validation check
            if (!json.id || !json.name) {
                throw new Error("Invalid product JSON: Missing 'id' or 'name'.");
            }

            const product = json as Product;

            // Optional: Check if we are overwriting? 
            // CreateProduct blindly overwrites (setDoc). 
            // Ideally we might check existence, but for "Import" usually overwriting is expected 
            // or explicit in the action. Let's just do it with a confirm.

            if (!confirm(`Importing product "${product.name}" (ID: ${product.id}). This will overwrite any existing product with the same ID. Continue?`)) {
                return;
            }

            await createProduct(product);

            alert(`Product "${product.name}" imported successfully!`);
            router.refresh();

        } catch (error) {
            console.error("Import failed:", error);
            alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsImporting(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={handleImportClick}
                disabled={isImporting}
                className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
                <span className="flex items-center gap-2">
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Import JSON
                </span>
            </button>

            <Link
                href="/admin/products/create"
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Product
                </span>
            </Link>
        </div>
    );
}
