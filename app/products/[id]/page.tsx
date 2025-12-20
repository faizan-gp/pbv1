import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
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



            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <ProductDetailView product={product} />
            </main>
        </div>
    );
}
