'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, SlidersHorizontal, ArrowUpDown, ChevronDown,
    X, Sparkles, Shirt, Scissors, Baby, ShoppingBag, Home as HomeIcon, Star, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/firestore/products';
import { trackEvent, fbTrack, tracksearch } from '@/lib/analytics';

// --- CONFIG ---
const CATEGORIES = [
    { id: 'all', label: 'All', icon: Star },
    { id: 'mens-clothing', label: 'Men', icon: Shirt },
    { id: 'womens-clothing', label: 'Women', icon: Scissors },
    { id: 'kids-clothing', label: 'Kids', icon: Baby },
    { id: 'accessories', label: 'Accessories', icon: ShoppingBag },
    { id: 'home-living', label: 'Home', icon: HomeIcon },
];

interface ProductsBrowserProps {
    initialProducts: Product[];
    initialCategory?: string;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductsBrowser({ initialProducts, initialCategory = 'all' }: ProductsBrowserProps) {
    // --- State ---
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // --- Filter Logic ---
    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        // Helper to normalize strings (slugify)
        const slugify = (text: string) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')     // Replace spaces with -
                .replace(/[^\w\-]+/g, '') // Remove all non-word chars
                .replace(/\-\-+/g, '-');  // Replace multiple - with single -
        };

        // 1. Category
        if (activeCategory !== 'all') {
            result = result.filter(p => {
                const productCategorySlug = p.category ? slugify(p.category) : '';
                return productCategorySlug === activeCategory;
            });
        }

        // 2. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.subcategory || '').toLowerCase().includes(lowerQuery)
            );
        }

        // 3. Sort
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-desc':
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'newest':
                result.reverse(); // Assuming initial is oldest -> newest or random
                break;
        }

        return result;
    }, [initialProducts, activeCategory, searchQuery, sortBy]);

    // --- Analytics ---
    useEffect(() => {
        // Debounce tracking to avoid spamming while typing/filtering
        const timer = setTimeout(() => {
            trackEvent('view_item_list', {
                item_list_name: activeCategory === 'all' ? 'All Products' : activeCategory,
                items: filteredProducts.slice(0, 10).map(p => ({
                    item_id: p.id,
                    item_name: p.name,
                    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
                }))
            });

            fbTrack('ViewContent', {
                content_type: 'product_group',
                content_ids: filteredProducts.slice(0, 10).map(p => p.id),
                content_category: activeCategory
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [filteredProducts, activeCategory]);

    useEffect(() => {
        if (!searchQuery) return;
        const timer = setTimeout(() => {
            tracksearch(searchQuery);
        }, 1500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 pb-24 relative selection:bg-indigo-500 selection:text-white">

            {/* --- HERO HEADER --- */}
            <div className="relative isolate overflow-hidden pt-14 pb-12 sm:pb-16 border-b border-slate-100">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-0 -z-20 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles size={12} /> Catalog
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
                            Premium Canvases <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                for Your Designs.
                            </span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                            Don't settle for low quality. We offer a curated selection of retail-grade products that feel as good as they look—ready for your custom touch.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- FILTER BAR (Sticky) --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-8">

                        {/* CATEGORY PILLS (Scrollable) */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide no-scrollbar flex items-center gap-2 pr-4">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                                            isActive
                                                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon size={14} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* DESKTOP SEARCH & SORT */}
                        <div className="hidden lg:flex items-center gap-4 shrink-0">
                            {/* Search */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-white"
                                />
                                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                            </div>

                            <div className="h-8 w-px bg-slate-200 mx-2" />

                            {/* Sort Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                                    <ArrowUpDown size={14} />
                                    Sort
                                    <ChevronDown size={14} />
                                </button>
                                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden min-w-[180px] p-1">
                                        {[
                                            { id: 'featured', label: 'Featured' },
                                            { id: 'newest', label: 'Newest Arrivals' },
                                            { id: 'price-asc', label: 'Price: Low to High' },
                                            { id: 'price-desc', label: 'Price: High to Low' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSortBy(opt.id as SortOption)}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-colors",
                                                    sortBy === opt.id ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MOBILE FILTER TRIGGER */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 shadow-sm"
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PRODUCT GRID --- */}
            <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {filteredProducts.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-32 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No canvases found</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                            We couldn't find any items matching your filters. Try selecting "All" or searching for something else.
                        </p>
                        <button
                            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </main>

            {/* --- MOBILE DRAWER --- */}
            <AnimatePresence>
                {showMobileFilters && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowMobileFilters(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900">Filters</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-8">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Search</h3>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Type to search..."
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Sort Order</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'featured', label: 'Featured' },
                                            { id: 'newest', label: 'Newest Arrivals' },
                                            { id: 'price-asc', label: 'Price: Low to High' },
                                            { id: 'price-desc', label: 'Price: High to Low' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSortBy(opt.id as SortOption)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                                    sortBy === opt.id ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-auto">
                                <button onClick={() => setShowMobileFilters(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20">
                                    Show Results
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SUBCOMPONENT: Product Card (Internal to ensure total redesign) ---
function ProductCard({ product }: { product: Product }) {
    // Determine a tag based on product data (optional, simulates logic)
    const isNew = Math.random() > 0.8; // Replace with actual date logic
    const isBestseller = Math.random() > 0.8;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <Link
                href={`/products/${product.id}`}
                className="group block h-full bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2"
            >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply z-10 pointer-events-none"></div>

                    {/* Badge */}
                    {(isNew || isBestseller) && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                                isNew ? "bg-white/90 text-indigo-600" : "bg-slate-900/90 text-white"
                            )}>
                                {isNew ? 'New Arrival' : 'Best Seller'}
                            </span>
                        </div>
                    )}

                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
                    />

                    {/* Quick Add Overlay (Desktop) */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 hidden lg:block">
                        <button className="w-full py-3 bg-white text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-900 hover:text-white transition-colors">
                            Customize Now
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{product.subcategory || product.category}</p>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>
                        </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between border-t border-slate-50 pt-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-400">Starting at</span>
                            <span className="text-xl font-black text-slate-900">${Number(product.price).toFixed(2)}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <ArrowUpDown className="rotate-90" size={14} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}