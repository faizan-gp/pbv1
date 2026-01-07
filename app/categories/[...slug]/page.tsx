import React from 'react';
import { notFound } from 'next/navigation';
import { getAllProducts } from '@/lib/firestore/products';
import { Metadata } from 'next';
import { getCategoryBySlug, getSubcategoryBySlug } from '@/lib/categories';
import CategoryPage from '@/app/components/CategoryPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    const firstSegment = slug[0];

    // Check if it's a category
    const categoryData = await getCategoryBySlug(firstSegment);
    if (categoryData && slug.length === 1) {
        return {
            title: categoryData.metaTitle,
            description: categoryData.metaDescription,
            keywords: categoryData.keywords,
            openGraph: {
                title: categoryData.metaTitle,
                description: categoryData.metaDescription,
                type: 'website',
            },
            alternates: {
                canonical: `https://www.printbrawl.com/categories/${categoryData.slug}`,
            }
        };
    }

    if (slug.length === 2) {
        const subcategoryData = await getSubcategoryBySlug(slug[0], slug[1]);
        if (subcategoryData) {
            return {
                title: `Best Custom ${subcategoryData.name} | Print Brawl`,
                description: `Create custom ${subcategoryData.name} with Print Brawl. High quality printing`,
                openGraph: {
                    title: `Best Custom ${subcategoryData.name} | Print Brawl`,
                    description: `Create custom ${subcategoryData.name} with Print Brawl.`,
                    type: 'website',
                },
                alternates: {
                    canonical: `https://www.printbrawl.com/categories/${slug[0]}/${slug[1]}`,
                }
            };
        }
    }

    return {
        title: "Category Not Found | Print Brawl",
    };
}

export default async function CategoryPageCatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    // 1. Check for Category Match
    if (slug.length === 1) {
        const categorySlug = slug[0];
        const categoryData = await getCategoryBySlug(categorySlug);

        if (categoryData) {
            const allProducts = await getAllProducts();
            const categoryProducts = allProducts.filter(p =>
                (p.category && (p.category === categoryData.name || p.category.toLowerCase() === categorySlug || p.category.toLowerCase() === categoryData.name.toLowerCase()))
            );
            return <CategoryPage category={categoryData} products={categoryProducts} />;
        }
    }

    // 2. Check for Subcategory Match (Level 2)
    if (slug.length === 2) {
        const categorySlug = slug[0];
        const subcategorySlug = slug[1];
        const subcategoryData = await getSubcategoryBySlug(categorySlug, subcategorySlug);

        if (subcategoryData) {
            const allProducts = await getAllProducts();
            const subcategoryProducts = allProducts.filter(p => {
                // 1. Must match parent category
                // Helper to match loosely
                const pCat = p.category?.toLowerCase() || '';
                const catMatch = pCat === categorySlug || pCat === 'womens clothing' && categorySlug === 'womens-clothing' || pCat === 'mens clothing' && categorySlug === 'mens-clothing';

                // 2. Must match subcategory
                const pSub = p.subcategory?.toLowerCase() || '';
                const subMatch = pSub === subcategorySlug || pSub === subcategoryData.name.toLowerCase();

                return (catMatch || p.category) && subMatch;
            });

            return <CategoryPage category={subcategoryData} products={subcategoryProducts} />;
        }
    }

    notFound();
}
