'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    ChevronRight, Filter, LayoutGrid, List as ListIcon,
    Search, X, ArrowUpDown, ChevronDown, Check, Sparkles, Shirt, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/app/components/ProductCard';
import { CategoryData } from '@/lib/categories';
import { Product } from '@/lib/firestore/products';
import { cn } from '@/lib/utils';

// --- Types ---
interface ExtendedProduct extends Product {
    createdAt?: any;
}

interface CategoryClientProps {
    category: CategoryData | null;
    products: Product[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function CategoryClient({ category, products }: CategoryClientProps) {
    // --- State ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // --- Derived Data ---

    // 1. Extract Unique Subcategories
    const subcategories = useMemo(() => {
        if (!category?.subcategories) return [];
        return Object.entries(category.subcategories).map(([slug, data]) => ({
            slug,
            name: data.name || slug
        }));
    }, [category]);

    // 2. Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products] as ExtendedProduct[];

        // Subcategory Filter
        if (selectedSubcategory !== 'all') {
            const target = selectedSubcategory.toLowerCase();
            result = result.filter(p => p.subcategory?.toLowerCase() === target);
        }

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category?.toLowerCase().includes(lowerQuery)
            );
        }

        // Price Filter
        if (priceRange.min) result = result.filter(p => Number(p.price) >= Number(priceRange.min));
        if (priceRange.max) result = result.filter(p => Number(p.price) <= Number(priceRange.max));

        // Sorting
        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => Number(a.price) - Number(b.price)); break;
            case 'price-desc': result.sort((a, b) => Number(b.price) - Number(a.price)); break;
            case 'newest': result.reverse(); break;
            default: break;
        }

        return result;
    }, [products, sortBy, searchQuery, priceRange, selectedSubcategory]);

    const clearAll = () => {
        setSearchQuery('');
        setPriceRange({ min: '', max: '' });
        setSelectedSubcategory('all');
        setSortBy('featured');
    };

    if (!category) return null;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-500 selection:text-white pb-24">

            {/* --- 1. HERO SECTION (Consistent with Theme) --- */}
            <div className="relative isolate overflow-hidden pt-14 pb-12 sm:pb-16">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />
                <div className="absolute inset-0 -z-20 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">
                        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                        <span className="mx-3 text-slate-300">/</span>
                        <Link href="/categories" className="hover:text-indigo-600 transition-colors">Collections</Link>
                        <span className="mx-3 text-slate-300">/</span>
                        <span className="text-indigo-600">{category.name}</span>
                    </nav>

                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                            Verified Collection
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900">
                                {category.name}
                            </span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                            {category.description || `Explore our premium collection of ${category.name}. Customizable, durable, and printed to perfection.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- 2. SUBCATEGORY PILLS (Sticky) --- */}
            {subcategories.length > 0 && (
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-indigo-50/50 shadow-sm">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide no-scrollbar pb-1">
                            <button
                                onClick={() => setSelectedSubcategory('all')}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                                    selectedSubcategory === 'all'
                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                )}
                            >
                                View All
                            </button>

                            {subcategories.map((sub) => (
                                <button
                                    key={sub.slug}
                                    onClick={() => setSelectedSubcategory(sub.slug)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border capitalize",
                                        selectedSubcategory === sub.slug
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                    )}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* --- 3. SIDEBAR FILTERS (Card Style) --- */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-8">
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm sticky top-24">
                            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
                                <Filter className="text-indigo-600" size={20} /> Filters
                            </h3>

                            {/* Search */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Search</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Product name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm group-hover:border-indigo-200"
                                    />
                                    <Search className="absolute left-3.5 top-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Price Range</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full pl-6 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        />
                                    </div>
                                    <span className="text-slate-300 font-bold">-</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full pl-6 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            {(searchQuery || priceRange.min || priceRange.max || selectedSubcategory !== 'all') && (
                                <button
                                    onClick={clearAll}
                                    className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* --- 4. MAIN CONTENT --- */}
                    <div className="flex-1">

                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="text-sm text-slate-500 font-medium">
                                Showing <span className="text-slate-900 font-black">{filteredProducts.length}</span> results
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Trigger */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2"
                                >
                                    <Filter size={16} /> Filters
                                </button>

                                {/* Sort */}
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="pl-12 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="newest">Newest</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>

                                {/* View Toggles */}
                                <div className="bg-slate-50 p-1 rounded-xl flex items-center gap-1 border border-slate-100">
                                    <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                                        <ListIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid/List */}
                        {filteredProducts.length > 0 ? (
                            <motion.div
                                layout
                                className={cn(
                                    "grid gap-6",
                                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                                )}
                            >
                                <AnimatePresence mode='popLayout'>
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* LIST VIEW CARD DESIGN */}
                                            {viewMode === 'list' ? (
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="group flex flex-col md:flex-row gap-6 p-4 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
                                                >
                                                    <div className="w-full md:w-48 aspect-square md:aspect-auto rounded-2xl overflow-hidden bg-slate-50 relative shrink-0">
                                                        <img src={product.image} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                                                    </div>
                                                    <div className="flex-1 py-2 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">{product.subcategory || category.name}</div>
                                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900">${Number(product.price).toFixed(2)}</div>
                                                        </div>
                                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 max-w-xl">
                                                            {product.shortDescription || "Premium quality, custom printed on demand."}
                                                        </p>
                                                        <div className="mt-auto flex items-center gap-4">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                                <Zap size={14} className="text-amber-400" fill="currentColor" />
                                                                Fast Shipping
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                                <Sparkles size={14} className="text-indigo-400" />
                                                                Premium Quality
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                /* GRID VIEW (Wrapping existing ProductCard or Custom Styled) */
                                                <div className="h-full">
                                                    <ProductCard product={product} />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-300">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                    We couldn't find any products matching your current filters.
                                </p>
                                <button
                                    onClick={clearAll}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- 5. MOBILE FILTERS DRAWER --- */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900">Filters</h2>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-8">
                                {/* Mobile Search */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Search</h3>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Search..."
                                    />
                                </div>

                                {/* Mobile Price */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Price</h3>
                                    <div className="flex gap-4">
                                        <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" />
                                        <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" />
                                    </div>
                                </div>

                                {/* Mobile Subcategories */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Subcategory</h3>
                                    <div className="space-y-2">
                                        <button onClick={() => setSelectedSubcategory('all')} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm font-bold", selectedSubcategory === 'all' ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600")}>View All</button>
                                        {subcategories.map(sub => (
                                            <button key={sub.slug} onClick={() => setSelectedSubcategory(sub.slug)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm font-bold capitalize", selectedSubcategory === sub.slug ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600")}>
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 mt-auto flex gap-4">
                                <button onClick={clearAll} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600">Reset</button>
                                <button onClick={() => setMobileFiltersOpen(false)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20">Apply</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}