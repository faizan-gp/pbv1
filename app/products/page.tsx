import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { Filter, ChevronDown } from "lucide-react";
import Product from '@/models/Product';
import dbConnect from '@/lib/db';
import { Metadata } from "next";

async function getProducts() {
    await dbConnect();
    // We use .lean() to get a plain JS object, serializable by Next.js
    const products = await Product.find({}).lean();
    // Convert _id to string manually if needed, or rely on .lean() with simple types.
    // Next.js serializes standard JSON types nicely.
    return JSON.parse(JSON.stringify(products));
}

export const dynamic = 'force-dynamic'; // Ensure we don't statically cache stale data

export const metadata: Metadata = {
    title: "All Products | PrintBrawl",
    description: "Browse our collection of premium custom apparel bases. T-shirts, hoodies, mugs, and more ready for your designs.",
};

export default async function ProductsPage() {
    const products = await getProducts();
    return (
        <div className="container-width py-12">
            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Filters Sidebar (UI Only - Simplified for functionality focus) */}
                <aside className="w-full lg:w-64 flex-none space-y-8">
                    <div className="flex items-center justify-between pb-4 border-b border-border lg:border-none lg:pb-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filters
                        </h2>
                        <button className="lg:hidden text-sm font-medium">Clear All</button>
                    </div>

                    <div className="hidden lg:block space-y-6">
                        {/* Category Filter */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-foreground">Category</h3>
                            <div className="space-y-2">
                                {["Apparel", "Accessories", "Home & Living", "Stationery"].map((category) => (
                                    <label key={category} className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                        <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
                        <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                            Sort by: Featured <ChevronDown className="ml-1 h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
