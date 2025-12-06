'use client';

import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ProductPreview from './ProductPreview';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

interface ShirtConfiguratorProps {
    product: any; // Using any for now to facilitate DB transition, ideally match Product type
}

export default function ShirtConfigurator({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(product);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);

    const handleAddToCart = () => {
        addToCart({
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: 29.99,
            quantity: 1,
            image: designTextureUrl || selectedColor.images['front'], // Use designed texture if available, else base image
            options: {
                color: selectedColor.name,
                customText: 'Custom Design', // Placeholder or extract if we had text input separately
            },
        });
        router.push("/cart");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        Custom T-Shirt Designer
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Create your unique style with our advanced 3D configurator. Drag, drop, and visualize in real-time.
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    <div className="w-full">
                        <DesignEditor
                            onUpdate={setDesignTextureUrl}
                            product={selectedProduct}
                            selectedColor={selectedColor}
                            onColorChange={setSelectedColor}
                            activeViewId={activeViewId}
                        />
                    </div>

                    <div className="w-full max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">3D Preview</h3>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart - $29.99
                                </button>
                            </div>
                            <div className="p-8 bg-gray-50">
                                <ProductPreview
                                    designTextureUrl={designTextureUrl}
                                    product={selectedProduct}
                                    selectedColor={selectedColor}
                                    activeViewId={activeViewId}
                                    onViewChange={setActiveViewId}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
