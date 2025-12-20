'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IProduct } from '@/models/Product';
import { Star, Truck, Shield, RefreshCw, Smartphone } from 'lucide-react';
import ProductInfoTabs from './ProductInfoTabs';
import { cn } from '@/lib/utils';

interface ProductDetailViewProps {
    product: IProduct;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Filter images based on selection
    const galleryImages = useMemo(() => {
        let images = product.listingImages || [];

        // Filter by color if selected, but always keep 'All'
        if (selectedColor) {
            images = images.filter(img => !img.color || img.color === 'All' || img.color === selectedColor);
        }

        // If we have structure, extract URLs. If legacy strings, use them.
        let urls = images.map(img => (typeof img === 'string' ? img : img.url));

        // Fallback: if no listing images, use main product image
        if (urls.length === 0 && product.image) {
            urls = [product.image];
        }

        // If filtering results in empty, maybe fallback to all?
        if (urls.length === 0 && (product.listingImages || []).length > 0) {
            urls = product.listingImages.map(img => (typeof img === 'string' ? img : img.url));
        }

        return urls;
    }, [product.listingImages, product.image, selectedColor]);

    const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || product.image;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT: Image Gallery (Takes up 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
                {/* Main Image */}
                <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative group">
                    <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-gray-100">
                        Premium Blank
                    </span>
                    <img
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                </div>

                {/* Thumbnails Grid */}
                {galleryImages.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        {galleryImages.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={cn(
                                    "aspect-square bg-white rounded-xl overflow-hidden border cursor-pointer hover:border-indigo-600 transition-all shadow-sm group relative",
                                    activeImageIndex === i ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2" : "border-gray-200"
                                )}
                            >
                                <img
                                    src={img}
                                    alt={`View ${i}`}
                                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Value Props */}
                <div className="hidden lg:grid grid-cols-3 gap-4 pt-4">
                    {[
                        { icon: Truck, title: "Fast Shipping", desc: "Ships in 2-3 days" },
                        { icon: Shield, title: "Quality Guarantee", desc: "Premium materials" },
                        { icon: RefreshCw, title: "Free Returns", desc: "Within 30 days" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                            <item.icon className="w-6 h-6 text-indigo-600 mb-2" />
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{item.title}</span>
                            <span className="text-[10px] text-gray-500 mt-1">{item.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">

                    {/* Header Info */}
                    <div className="border-b border-gray-100 pb-8 mb-8">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-indigo-100">
                            {product.category}
                        </span>
                        {product.trending && (
                            <span className="ml-2 inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-amber-100">
                                Best Seller
                            </span>
                        )}

                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-end gap-4 mb-6">
                            <div className="text-4xl font-bold text-gray-900 tracking-tight">$29.00</div>
                            <div className="text-sm font-medium text-gray-400 mb-2 line-through">$45.00</div>
                            <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-2">SAVE 35%</div>
                        </div>

                        <div className="flex items-center gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                            <span className="text-xs font-bold text-gray-500 ml-2 border-b border-gray-300">4.9 (128 Reviews)</span>
                        </div>

                        {product.shortDescription && (
                            <p className="text-base text-gray-600 leading-relaxed font-medium">
                                {product.shortDescription}
                            </p>
                        )}
                    </div>

                    {/* Color Selection */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Select Color</h3>
                                <span className="text-xs font-medium text-indigo-600">{selectedColor}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.colors.map((color: any, i: number) => (
                                    <div key={i} className="group relative">
                                        <div
                                            onClick={() => {
                                                setSelectedColor(color.name);
                                                setActiveImageIndex(0); // Reset gallery to first image of new color
                                            }}
                                            className={cn(
                                                "w-10 h-10 rounded-full shadow-sm cursor-pointer transition-all border-2",
                                                selectedColor === color.name ? "border-indigo-600 ring-2 ring-indigo-100 scale-110" : "border-gray-200 hover:border-gray-300"
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        >
                                            {selectedColor === color.name && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href={`/customize/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`} // Pass selected color to customizer potentially?
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            <Smartphone className="w-5 h-5" />
                            Customize Design
                        </Link>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Start with a blank canvas or choose a pre-made design.
                        </p>
                    </div>

                    {/* TABS COMPONENT */}
                    <ProductInfoTabs
                        description={product.fullDescription}
                        features={product.features}
                        careInstructions={product.careInstructions}
                        sizeGuide={product.sizeGuide}
                    />

                </div>
            </div>
        </div>
    );
}
