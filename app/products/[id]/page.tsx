import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import { ArrowLeft } from 'lucide-react';
import ProductDetailView from '@/app/components/ProductDetailView';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findOne({ id }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product)) as IProduct;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans pb-24 selection:bg-indigo-500 selection:text-white">
            {/* Global Background Noise */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            {/* Navigation */}
            <nav className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/products" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Products
                    </Link>
                    <Link href="/" className="text-xl font-black tracking-tighter text-slate-900">
                        PRINT<span className="text-indigo-600">BRAWL</span>
                    </Link>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <ProductDetailView product={product} />
            </main>
        </div>
    );
}
