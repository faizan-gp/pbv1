'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IProduct } from '@/models/Product';
import { Star, ArrowRight, ShieldCheck, Zap, Package, Heart, Share2 } from 'lucide-react';
import ProductInfoTabs from './ProductInfoTabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductDetailViewProps {
    product: IProduct;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Filter images based on selection
    const galleryImages = useMemo(() => {
        let images = product.listingImages || [];
        if (selectedColor) {
            images = images.filter(img => !img.color || img.color === 'All' || img.color === selectedColor);
        }
        let urls = images.map(img => (typeof img === 'string' ? img : img.url));
        if (urls.length === 0 && product.image) urls = [product.image];
        if (urls.length === 0 && (product.listingImages || []).length > 0) {
            urls = product.listingImages.map(img => (typeof img === 'string' ? img : img.url));
        }
        return urls;
    }, [product.listingImages, product.image, selectedColor]);

    const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || product.image;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 relative items-start">

            {/* --- LEFT COLUMN: IMMERSIVE GALLERY --- */}
            <div className="lg:col-span-7 flex flex-col gap-6">

                {/* Main Stage */}
                <div className="relative w-full aspect-[4/5] lg:aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden group">
                    <motion.img
                        key={activeImage} // Triggers animation on change
                        initial={{ opacity: 0.8, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-contain p-12 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-8 left-8 flex flex-col gap-3 items-start">
                        {product.trending && (
                            <span className="px-4 py-2 bg-black/90 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md">
                                Best Seller
                            </span>
                        )}
                        <span className="px-4 py-2 bg-white/80 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm backdrop-blur-md border border-white/50">
                            Premium Heavyweight
                        </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Thumbnails Strip */}
                {galleryImages.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {galleryImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={cn(
                                    "relative flex-none w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden transition-all duration-300",
                                    activeImageIndex === i
                                        ? "ring-2 ring-black ring-offset-2 opacity-100"
                                        : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Desktop Tabs Positioned Below Images */}
                <div className="hidden lg:block pt-10 border-t border-slate-100 mt-6">
                    <ProductInfoTabs
                        description={product.fullDescription}
                        features={product.features}
                        careInstructions={product.careInstructions}
                        sizeGuide={product.sizeGuide}
                    />
                </div>
            </div>

            {/* --- RIGHT COLUMN: STICKY DETAILS PANEL --- */}
            <div className="lg:col-span-5 relative">
                <div className="lg:sticky lg:top-12 space-y-10">

                    {/* Product Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                            <Zap className="w-4 h-4" />
                            {product.category}
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-medium text-slate-900">$29.00</span>
                                <span className="text-lg text-slate-400 line-through">$45.00</span>
                            </div>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-slate-900">4.9</span>
                                <span className="text-slate-400 text-sm">(128 Reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Color Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-slate-900">Select Color</span>
                                <span className="text-slate-500">{selectedColor}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.colors.map((color: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedColor(color.name);
                                            setActiveImageIndex(0);
                                        }}
                                        className={cn(
                                            "w-12 h-12 rounded-full relative flex items-center justify-center transition-all duration-300",
                                            selectedColor === color.name ? "scale-110 ring-2 ring-black ring-offset-2" : "hover:scale-105"
                                        )}
                                    >
                                        <span
                                            className="w-full h-full rounded-full border border-slate-200 shadow-sm"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="flex flex-col gap-4 pt-4">
                        <Link
                            href={`/customize/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`}
                            className="group relative w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Customize Design <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                        </Link>

                        <p className="text-center text-xs text-slate-400 font-medium">
                            Free shipping on orders over $100 • 30 Day Returns
                        </p>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Package, title: "Fast Delivery", desc: "Ships in 2-3 business days" },
                            { icon: ShieldCheck, title: "Quality Guarantee", desc: "Premium materials only" }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                                <item.icon className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Tabs (Hidden on Desktop) */}
                    <div className="lg:hidden pt-8 border-t border-slate-100">
                        <ProductInfoTabs
                            description={product.fullDescription}
                            features={product.features}
                            careInstructions={product.careInstructions}
                            sizeGuide={product.sizeGuide}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}