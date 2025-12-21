'use client';

import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ProductPreview from './ProductPreview';
import { useCart } from '../context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Check, Layers, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, or simply use template literals

interface ShirtConfiguratorProps {
    product: any;
}

export default function ShirtConfiguratorDesktop({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToCart } = useCart();

    // State
    const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(product);

    // Color Logic
    const defaultColor = { name: 'Default', hex: '#ffffff', images: {} };
    const urlColorName = searchParams.get('color');
    const initialColor = product.colors?.find((c: any) => c.name === urlColorName) || product.colors?.[0] || defaultColor;
    const [selectedColor, setSelectedColor] = useState(initialColor);

    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
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
        <div className="relative h-screen w-full bg-[#FAFAFA] text-slate-900 overflow-hidden flex flex-col">

            {/* Background Texture for "Premium" feel */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>

            {/* --- TOP NAVIGATION BAR --- */}
            <header className="h-16 border-b border-black/5 bg-white/50 backdrop-blur-md z-50 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/products" className="group flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {product.name}
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                                Customizer
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/50 text-indigo-600 text-xs font-bold border border-indigo-100/50 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden sm:inline">Professional Studio</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. LEFT: THE CANVAS (Design Editor) */}
                <div className="flex-1 bg-slate-100/50 relative flex flex-col p-6 overflow-hidden">
                    <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden flex flex-col relative transition-all duration-500">
                        <DesignEditor
                            onUpdate={setDesignTextureUrl}
                            product={selectedProduct}
                            activeViewId={activeViewId}
                        // Assuming DesignEditor might need color info or rendering context
                        />
                    </div>
                </div>

                {/* 2. RIGHT: CONFIGURATION & PREVIEW */}
                <div className="w-[440px] bg-white border-l border-black/5 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* 3D Preview */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative aspect-square shadow-inner">
                                <ProductPreview
                                    designTextureUrl={designTextureUrl}
                                    product={selectedProduct}
                                    selectedColor={selectedColor}
                                    activeViewId={activeViewId}
                                    onViewChange={setActiveViewId}
                                />
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Base Color</label>
                                <span className="text-xs font-medium text-slate-700">{selectedColor.name}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-3">
                                {product.colors?.map((c: any) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setSelectedColor(c)}
                                        className={cn(
                                            "relative w-10 h-10 rounded-full border shadow-sm transition-all duration-200 flex items-center justify-center",
                                            selectedColor.name === c.name
                                                ? "ring-2 ring-indigo-600 ring-offset-2 scale-110 border-transparent"
                                                : "border-slate-200 hover:scale-105 hover:border-slate-300"
                                        )}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    >
                                        {selectedColor.name === c.name && (
                                            <Check className={cn("w-4 h-4", c.name.toLowerCase() === 'white' ? 'text-black' : 'text-white')} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Details (Collapsible styling visually) */}
                        <div className="pt-6 border-t border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Check className="w-3 h-3 text-indigo-500" /> Premium Heavyweight Cotton
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Check className="w-3 h-3 text-indigo-500" /> Direct-to-Garment (DTG) Print
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Check className="w-3 h-3 text-indigo-500" /> Ships in 2-3 Business Days
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Area (Sticky) */}
                    <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Price</p>
                                <div className="text-3xl font-bold text-slate-900 tracking-tight">$29.99</div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                    In Stock
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="group relative w-full h-14 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(93,93,255,0.23)] hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isAdding ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-12" />
                                        Add to Cart
                                    </>
                                )}
                            </span>

                            {/* Shine Effect */}
                            {!isAdding && (
                                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-shine" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}