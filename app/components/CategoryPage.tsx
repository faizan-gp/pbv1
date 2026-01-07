
import React from 'react';
import { CategoryData } from '@/lib/categories';
import { Product } from '@/lib/firestore/products';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface CategoryPageProps {
    category: CategoryData;
    products: Product[];
}

export default function CategoryPage({ category, products }: CategoryPageProps) {
    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16 md:py-24">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        {category.name}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Breadcrumb (Simple) */}
            <div className="border-b border-slate-100 bg-white">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-slate-900 transition-colors">Products</Link>
                        <span>/</span>
                        <span className="font-medium text-slate-900">{category.name}</span>
                    </div>
                </div>
            </div>

            {/* Subcategories (Pills) */}
            {category.subcategories && (
                <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(category.subcategories).map(([key, sub]) => (
                                <Link
                                    key={key}
                                    href={`/products/${category.slug}/${sub.slug}`}
                                    className="px-5 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:shadow-md"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500 text-lg">No products found in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((product) => (
                            <Link href={`/products/${product.id}`} key={product.id} className="group block">
                                <div className="relative aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden mb-5">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply p-4"
                                    />
                                    {product.trending && (
                                        <div className="absolute top-3 left-3 bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                                            Best Seller
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {product.name}
                                        </h3>
                                        <span className="font-medium text-slate-900 shrink-0">
                                            ${(product.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{product.category}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-slate-900">4.9</span>
                                        <span className="text-xs text-slate-400">(24)</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* SEO Content Block (Bottom) */}
            <section className="bg-slate-50 py-16 md:py-24 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">Why Choose Our {category.name}?</h2>
                    <p className="text-slate-600 leading-relaxed md:text-lg">
                        At Print Brawl, we pride ourselves on delivering premium quality custom apparel.
                        Our {category.name.toLowerCase()} collection is designed for comfort, durability, and style.
                        Whether you are looking for a single custom piece or bulk orders for your team,
                        we have got you covered with high-quality printing and fast USA shipping.
                    </p>
                </div>
            </section>
        </div>
    );
}
