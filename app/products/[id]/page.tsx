import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import ProductDetailView from '@/app/components/ProductDetailView';

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

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-black selection:text-white overflow-x-hidden">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
                <ProductDetailView product={product} />
            </main>
        </div>
    );
}