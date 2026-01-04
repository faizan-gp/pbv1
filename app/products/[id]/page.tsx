import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, Product } from '@/lib/firestore/products';
import ProductDetailView from '@/app/components/ProductDetailView';
import { Metadata } from 'next';
import ProductSchema from '@/app/components/seo/ProductSchema';
import BreadcrumbSchema from '@/app/components/seo/BreadcrumbSchema';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
    const product = await getProductById(id);
    if (!product) return null;
    return product;
}

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: "Product Not Found | Print Brawl",
        };
    }

    const title = `${product.name} - Custom ${product.category} | Print Brawl`;
    const description = product.shortDescription ||
        `Customize ${product.name}. ${product.fullDescription || 'Premium quality custom apparel with our online design studio.'}`;

    return {
        title,
        description,
        keywords: [
            product.name,
            `custom ${product.category}`,
            product.subcategory,
            "print on demand",
            "custom apparel"
        ].filter((k): k is string => !!k),
        openGraph: {
            title,
            description,
            type: "website",
            images: [
                {
                    url: product.image,
                    width: 1200,
                    height: 1200,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [product.image],
        },
        alternates: {
            canonical: `https://www.printbrawl.com/products/${id}`,
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-black selection:text-white overflow-x-hidden">
            <ProductSchema product={product} />
            <BreadcrumbSchema items={[
                { name: "Home", url: "/" },
                { name: "Products", url: "/products" },
                { name: product.category, url: `/products?category=${encodeURIComponent(product.category)}` },
                { name: product.name, url: `/products/${product.id}` }
            ]} />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
                <ProductDetailView product={product} />
            </main>
        </div>
    );
}