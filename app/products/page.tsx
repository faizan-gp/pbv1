import Link from "next/link";
import ProductCard from "../components/ProductCard";
import ProductSidebar from "../components/ProductSidebar";
import { Filter, ChevronDown, LayoutGrid, Sparkles } from "lucide-react";
import Product from '@/models/Product';
import dbConnect from '@/lib/db';
import { Metadata } from "next";

// Force dynamic rendering so search params work
export const dynamic = 'force-dynamic';

async function getProducts(category?: string, subcategory?: string) {
    await dbConnect();
    const query: any = {};
    if (category) {
        // Case insensitive regex for better UX
        query.category = { $regex: new RegExp(category, 'i') };
    }
    if (subcategory) {
        query.subcategory = { $regex: new RegExp(subcategory, 'i') };
    }
    const products = await Product.find(query).lean();
    return JSON.parse(JSON.stringify(products));
}

export const metadata: Metadata = {
    title: "Select Your Canvas | PrintBrawl",
    description: "Browse our collection of premium custom apparel bases. T-shirts, hoodies, mugs, and more ready for your designs.",
};

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; subcategory?: string }>;
}) {
    const params = await searchParams;
    const products = await getProducts(params.category, params.subcategory);
    const categoryLabel = params.subcategory
        ? `${params.category} / ${params.subcategory}`
        : (params.category ? params.category : "All Canvases");

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white pb-24 relative overflow-hidden">

            {/* --- GLOBAL BACKGROUND (Consistent with Home) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* --- HEADER SECTION --- */}
            <div className="relative z-10 bg-white border-b border-slate-200 pt-16 pb-12 shadow-sm">
                <div className="container-width px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                            <Sparkles className="w-3 h-3" /> Premium Blanks
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">
                            Select Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Canvas</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                            Every masterpiece needs a foundation. We've sourced retail-quality fabrics that hold ink perfectly and stand the test of time.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="container-width px-4 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* --- SIDEBAR (Sticky) --- */}
                    <ProductSidebar />

                    {/* --- PRODUCT GRID --- */}
                    <div className="flex-1">

                        {/* Toolbar */}
                        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-slate-400" />
                                <h2 className="font-bold text-slate-900 capitalize">{categoryLabel}</h2>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {products.length} results
                                </span>
                            </div>

                            <div className="relative group">
                                <button className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                                    Sort by: <span className="text-slate-900">Featured</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {/* Sort Dropdown (Hover) */}
                                <div className="absolute right-0 top-full pt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                    <div className="bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden py-1 text-sm font-medium text-slate-600">
                                        <button className="block w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Price: Low to High</button>
                                        <button className="block w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Price: High to Low</button>
                                        <button className="block w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Newest Arrivals</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Filter className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                    We couldn't find any canvases matching "{params.category}". Try selecting a different category or clearing your filters.
                                </p>
                                <Link href="/products" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors">
                                    View All Canvases
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}