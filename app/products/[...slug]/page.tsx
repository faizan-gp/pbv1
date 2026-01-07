import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getProductById, getAllProducts, Product } from '@/lib/firestore/products';
import ProductDetailView from '@/app/components/ProductDetailView';
import { Metadata } from 'next';
import ProductSchema from '@/app/components/seo/ProductSchema';
import BreadcrumbSchema from '@/app/components/seo/BreadcrumbSchema';
import ProductDescriptionServer from '@/app/components/ProductDescriptionServer';
import { getCategoryBySlug, getSubcategoryBySlug } from '@/lib/categories';
import CategoryPage from '@/app/components/CategoryPage';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
    const product = await getProductById(id);
    if (!product) return null;
    return product;
}

export async function generateMetadata({ params }: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    // Product Metadata
    const productId = slug[slug.length - 1];
    const product = await getProductById(productId);

    if (!product) {
        return {
            title: "Not Found | Print Brawl",
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
            canonical: `https://www.printbrawl.com/products/${productId}`,
        },
    };
}

export default async function ProductPageCatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    // Product Detail Page
    // Assuming the LAST segment is the ID for now.
    const productId = slug[slug.length - 1];
    const product = await getProduct(productId);

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-black selection:text-white overflow-x-hidden">
            <ProductSchema product={product} />
            <BreadcrumbSchema items={[
                { name: "Home", url: "/" },
                { name: "Products", url: "/products" },
                { name: product.category, url: `/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
                { name: product.name, url: `/products/${product.id}` }
            ]} />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
                <ProductDetailView
                    product={product}
                    descriptionSlot={<ProductDescriptionServer product={product} />}
                />
            </main>
        </div>
    );
}