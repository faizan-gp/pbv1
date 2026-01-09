import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCategoryBySlug, getSubcategoryBySlug, CategoryData } from '@/lib/categories';
import { getAllProducts, Product } from '@/lib/firestore/products';
import CategoryClient from './CategoryClient';
import CategorySchema from '@/app/components/seo/CategorySchema';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    let category: CategoryData | null = null;

    if (slug.length === 1) {
        category = await getCategoryBySlug(slug[0]);
    } else if (slug.length === 2) {
        category = await getSubcategoryBySlug(slug[0], slug[1]);
    }

    if (!category) {
        return {
            title: 'Category Not Found | Print Brawl',
        };
    }

    return {
        title: category.metaTitle || `${category.name} | Print Brawl`,
        description: category.metaDescription || category.description,
        keywords: category.keywords,
        openGraph: {
            title: category.metaTitle || category.name,
            description: category.metaDescription || category.description,
        }
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;

    let category: CategoryData | null = null;
    let isSubcategory = false;

    // 1. Identify Category
    if (slug.length === 1) {
        // Top-level category
        category = await getCategoryBySlug(slug[0]);
    } else if (slug.length === 2) {
        // Subcategory
        isSubcategory = true;
        category = await getSubcategoryBySlug(slug[0], slug[1]);
        if (category) {
            // Ensure parentCategory is set if missing (helpful for breadcrumbs)
            if (!category.parentCategory) {
                // Try to fetch parent to get its name? 
                // Or just assume slug[0] is close enough for linking, but Name is better.
                // For now, let's just make sure we pass what we have.
                const parent = await getCategoryBySlug(slug[0]);
                if (parent) {
                    category = { ...category, parentCategory: parent.name };
                }
            }
        }
    }

    if (!category) {
        notFound();
    }

    // 2. Fetch Products
    const allProducts = await getAllProducts(); // Potential optimization: query only needed products

    // 3. Filter Products
    const filteredProducts = allProducts.filter(p => {
        if (!p.category) return false;

        // Normalization helper
        const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

        const productCatSlug = normalize(p.category);
        const targetCatSlug = normalize(category!.slug || category!.name); // category is not null here

        if (isSubcategory) {
            // Must match category AND subcategory
            const parentSlug = normalize(slug[0]);

            // Check Parent Category Match
            // Support both "Women's Clothing" (Name) and "womens-clothing" (Slug)
            const productParentMatch = productCatSlug === parentSlug || productCatSlug === normalize(category!.parentCategory || '');

            // Check Subcategory Match
            const productSub = p.subcategory ? normalize(p.subcategory) : '';
            const targetSub = normalize(category!.name);
            const targetSubSlug = normalize(category!.slug);
            const urlSub = normalize(slug[1]); // Direct URL match

            const isMatch = productParentMatch && (
                productSub === targetSub ||
                productSub === targetSubSlug ||
                productSub === urlSub
            );

            return isMatch;
        } else {
            // specific category page (e.g. Men's Clothing)
            // Match category only.
            return productCatSlug === targetCatSlug || normalize(p.category) === normalize(category!.name);
        }
    });

    // Prepare subcategories array for client
    const subcategoriesMap = isSubcategory
        ? (await getCategoryBySlug(slug[0]))?.subcategories
        : category.subcategories;

    const subcategoriesList = subcategoriesMap
        ? Object.entries(subcategoriesMap).map(([s, d]) => ({ slug: s, name: d.name || s }))
        : [];

    const basePath = `/categories/${slug[0]}`;
    const currentSubcategorySlug = isSubcategory ? slug[1] : null;

    return (
        <>
            <CategorySchema category={category} products={filteredProducts} />
            <CategoryClient
                category={category}
                products={filteredProducts}
                subcategories={subcategoriesList}
                currentSubcategorySlug={currentSubcategorySlug}
                basePath={basePath}
            />
        </>
    );
}