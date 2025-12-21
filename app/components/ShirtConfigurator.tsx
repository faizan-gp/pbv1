'use client';

import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ProductPreview from './ProductPreview';
import { useCart } from '../context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Check, Layers } from 'lucide-react';
import Link from 'next/link';

interface ShirtConfiguratorProps {
    product: any;
}

export default function ShirtConfigurator({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToCart } = useCart();
    const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(product);

    // Initial color from URL or fallback
    const defaultColor = { name: 'Default', hex: '#ffffff', images: {} };
    const urlColorName = searchParams.get('color');
    const initialColor = product.colors?.find((c: any) => c.name === urlColorName) || product.colors?.[0] || defaultColor;

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        // Simulate network delay for UX
        setTimeout(() => {
            addToCart({
                productId: selectedProduct.id,
                name: selectedProduct.name,
                price: 29.99,
                quantity: 1,
                image: designTextureUrl || selectedColor.images['front'] || selectedProduct.image,
                options: {
                    color: selectedColor.name,
                    customText: 'Custom Design',
                },
            });
            router.push("/cart");
        }, 800);
    };

    return (
        <div className="relative z-10 pt-20 lg:pt-24 pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row gap-6">

            {/* --- LEFT: DESIGN STUDIO (The Workspace) --- */}
            <div className="flex-1 flex flex-col min-h-[600px] lg:min-h-[calc(100vh-140px)]">
                {/* Studio Header */}
                <div className="flex items-center justify-between mb-4">
                    <Link href="/products" className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
                    </Link>
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <Layers className="w-3 h-3" /> Professional Mode
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative">
                    <DesignEditor
                        onUpdate={setDesignTextureUrl}
                        product={selectedProduct}
                        selectedColor={selectedColor}
                        activeViewId={activeViewId}
                    />
                </div>
            </div>

            {/* --- RIGHT: PREVIEW & CHECKOUT (The Result) --- */}
            <div className="w-full lg:w-[420px] flex flex-col gap-6">

                {/* 3D Preview Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex-1 min-h-[400px]">
                    <ProductPreview
                        designTextureUrl={designTextureUrl}
                        product={selectedProduct}
                        selectedColor={selectedColor}
                        activeViewId={activeViewId}
                        onViewChange={setActiveViewId}
                    />
                </div>

                {/* Checkout / Action Card */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
                                <p className="text-slate-400 text-sm mt-1">{selectedColor.name} &bull; Custom Print</p>
                            </div>
                            <div className="text-2xl font-mono font-bold text-indigo-300">$29.99</div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                <Check className="w-3 h-3 text-green-400" /> High-Resolution Export
                                <span className="mx-1">&bull;</span>
                                <Check className="w-3 h-3 text-green-400" /> DTG Printing
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="w-full h-14 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isAdding ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}