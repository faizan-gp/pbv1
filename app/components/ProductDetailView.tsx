'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product as IProduct } from '@/lib/firestore/products';
import Link from 'next/link';
import { Star, ArrowRight, ShieldCheck, Zap, Package, Heart } from 'lucide-react';

import ProductSizeGuide from './ProductSizeGuide';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Breadcrumbs from './ui/Breadcrumbs';

interface ProductDetailViewProps {
    product: IProduct;
    descriptionSlot?: React.ReactNode;
}

export default function ProductDetailView({ product, descriptionSlot }: ProductDetailViewProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const galleryImages = useMemo(() => {
        let images = product.listingImages || [];
        if (selectedColor) {
            images = images.filter(img => !img.color || img.color === 'All' || img.color === selectedColor);
        } else {
            images = images.filter(img => !img.color || img.color === 'All');
        }
        let urls = images.map(img => (typeof img === 'string' ? img : img.url));
        if (urls.length === 0 && product.image) urls = [product.image];
        if (urls.length === 0 && (product.listingImages || []).length > 0) {
            urls = (product.listingImages || []).map(img => (typeof img === 'string' ? img : img.url));
        }
        return urls;
    }, [product.listingImages, product.image, selectedColor]);

    const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || product.image;

    const breadcrumbItems = [
        { label: 'Products', href: '/products' },
        ...(product.category ? [{ label: product.category, href: `/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
        { label: product.name, href: `/products/${product.id}` }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-24 relative items-start w-full">
            <div className="lg:col-span-12 mb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* --- LEFT COLUMN: IMMERSIVE GALLERY --- */}
            {/* ADDED: min-w-0 is critical here to prevent horizontal scroll on mobile */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full min-w-0">

                {/* Main Stage */}
                <div className="relative w-full aspect-[4/5] lg:aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden group border border-slate-100">
                    <motion.img
                        key={activeImage}
                        initial={{ opacity: 0.8, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        src={activeImage}
                        alt={product.name}
                        loading="eager"
                        fetchPriority="high"
                        className="w-full h-full object-contain p-8 md:p-12 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-3 items-start z-10">
                        {product.trending && (
                            <span className="px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md">
                                Best Seller
                            </span>
                        )}
                        <span className="px-3 py-1.5 bg-white/90 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm backdrop-blur-md border border-white/50">
                            Premium
                        </span>
                    </div>

                    <div className="absolute top-6 right-6 z-10">
                        <button className="p-2.5 bg-white rounded-full shadow-md hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Thumbnails Strip */}
                {/* overflow-x-auto works now because parent has min-w-0 */}
                {galleryImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 w-full scrollbar-hide snap-x">
                        {galleryImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={cn(
                                    "relative flex-none snap-start w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 overflow-hidden transition-all duration-300 border-2",
                                    activeImageIndex === i
                                        ? "border-slate-900 opacity-100"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply" alt={`${product.name} view ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Desktop Details (Stacked) */}
                <div className="hidden lg:block pt-8 border-t border-slate-100 mt-2">
                    {descriptionSlot}
                    <ProductSizeGuide sizeGuide={product.sizeGuide} />
                </div>
            </div>

            {/* --- RIGHT COLUMN: STICKY DETAILS PANEL --- */}
            {/* ADDED: min-w-0 here too just in case */}
            <div className="lg:col-span-5 relative w-full min-w-0">
                <div className="lg:sticky lg:top-8 space-y-8">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            <Zap className="w-3.5 h-3.5" />
                            {product.category}
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight break-words">
                            {product.name}
                        </h1>


                        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-medium text-slate-900">${(product.price || 0).toFixed(2)}</span>
                            </div>
                            {/* <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-slate-900">4.9</span>
                                <span className="text-slate-400 text-sm">(128 Reviews)</span>
                            </div> */}
                        </div>
                    </div>

                    {/* Color Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-100">
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
                                            "w-10 h-10 md:w-12 md:h-12 rounded-full relative flex items-center justify-center transition-all duration-300",
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

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <Link
                            href={`/customize/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`}
                            className="group relative w-full bg-slate-900 hover:bg-black text-white py-4 md:py-5 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Customize Design <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    icon: Package,
                                    title: "Shipping & Production",
                                    desc: product.productionTime
                                        ? `Production: ${product.productionTime} • Shipping: ${product.shippingTime || '2-5 days'}`
                                        : `USA Shipping: ${product.shippingCost ? `$${product.shippingCost}` : 'Free'} • ${product.shippingTime || '2-5 business days'}`
                                },
                                { icon: ShieldCheck, title: "Quality Guarantee", desc: "Premium materials & expert support" }
                            ].map((item, i) => (
                                <div key={i} className="bg-indigo-50/50 p-4 rounded-xl flex items-start gap-3 border border-indigo-50">
                                    <div className="bg-indigo-100/50 p-2 rounded-lg shrink-0">
                                        <item.icon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Stacked View */}
                    <div className="lg:hidden pt-8 border-t border-slate-100">
                        {descriptionSlot}
                        <ProductSizeGuide sizeGuide={product.sizeGuide} />
                    </div>
                </div>
            </div>
        </div>
    );
}