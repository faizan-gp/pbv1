"use client";

import { useState } from "react";
import { ShoppingCart, Type, Palette as PaletteIcon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

// Define the shape of the Product prop (subset or full)
interface Product {
    id: string;
    name: string;
    image: string;
    colors: { name: string; hex: string; images: Record<string, string> }[];
}

interface ProductCustomizerProps {
    product: Product;
}

export default function ProductCustomizer({ product }: ProductCustomizerProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
    const [customText, setCustomText] = useState("");

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: 29.99, // Hardcoded price for now
            quantity: 1,
            image: selectedColor?.images?.['front'] || product.image,
            options: {
                color: selectedColor?.name,
                customText: customText,
            },
        });
        // Optional: show toast or redirect
        router.push("/cart");
    };

    return (
        <div className="container-width py-12">
            <div className="md:grid md:grid-cols-2 md:gap-x-12 md:items-start">
                {/* Left Column: Product Preview */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted border border-border">
                    {/* Visual indicator of "customization" */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Background Image (Base Product) */}
                        <div className="relative h-full w-full">
                            {/* In a real app we would use Next/Image properly, but for dynamic paths from data we need to be careful */}
                            <img
                                src={selectedColor?.images?.['front'] || product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>

                        {/* Text Overlay (Simple Visualization) */}
                        {customText && (
                            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-center" style={{ width: '150px' }}>
                                <span className="text-xl font-bold text-black/80 break-words font-mono uppercase tracking-widest">{customText}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Configuration Panel */}
                <div className="mt-10 px-4 sm:mt-16 sm:px-0 md:mt-0">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                    <div className="mt-3">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-3xl tracking-tight text-foreground">$29.99</p>
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
                        {/* Configuration Options */}
                        <div className="space-y-6">

                            {/* Color Selection */}
                            <div>
                                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <PaletteIcon className="h-4 w-4" /> Select Color: <span className="text-muted-foreground">{selectedColor?.name}</span>
                                </h3>
                                <div className="mt-4 flex items-center space-x-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-8 w-8 rounded-full border border-gray-300 focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-primary ${selectedColor?.name === color.name ? 'ring-primary' : ''}`}
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={`Select color ${color.name}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Text Input */}
                            <div>
                                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Type className="h-4 w-4" /> Add Text
                                </h3>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700"
                                        placeholder="Enter text to print"
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Add to Cart */}
                        <div className="mt-10 flex">
                            <button
                                onClick={handleAddToCart}
                                type="button"
                                className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-50 hover:opacity-90 sm:w-full"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
