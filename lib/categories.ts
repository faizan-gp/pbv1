
import { getAllCategoriesFromDB } from './firestore/categories';

export interface CategoryData {
    slug: string;
    name: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    subcategories?: Record<string, CategoryData>; // Recursive definition for subcategories
}

// Fallback / Static Cache
export let CATEGORIES: Record<string, CategoryData> = {
    'mens-clothing': {
        slug: 'mens-clothing',
        name: "Men's Clothing",
        description: "Explore our collection of premium custom men's apparel. From t-shirts to hoodies, personalize your look.",
        metaTitle: "Custom Men's Clothing & Apparel | Print Brawl",
        metaDescription: "Design your own men's t-shirts, hoodies, and more. High-quality print-on-demand men's clothing made in the USA.",
        keywords: ["custom mens clothing", "mens custom t-shirts", "custom hoodies for men", "print on demand mens apparel"],
        subcategories: {}
    },
    'womens-clothing': {
        slug: 'womens-clothing',
        name: "Women's Clothing",
        description: "Discover stylish custom women's clothing. Create unique tops, hoodies, and accessories.",
        metaTitle: "Custom Women's Clothing & Apparel | Print Brawl",
        metaDescription: "Create custom women's t-shirts, tank tops, and sweatshirts. Premium quality and fast shipping.",
        keywords: ["custom womens clothing", "womens custom t-shirts", "custom ladies apparel", "print on demand womens fashion"],
        subcategories: {
            'sweatshirts': {
                slug: 'sweatshirts',
                name: "Sweatshirts",
                description: "Cozy and stylish custom sweatshirts for women.",
                metaTitle: "Custom Women's Sweatshirts | Print Brawl",
                metaDescription: "Design your own women's sweatshirts. Premium quality and warm.",
                keywords: ["custom sweatshirts", "womens hoodies", "printed sweatshirts"]
            }
        }
    }
};

let isCategoriesFetched = false;

export const getCategories = async () => {
    if (!isCategoriesFetched) {
        try {
            const dbCategories = await getAllCategoriesFromDB();
            // Merge or replacement strategy. For now, let's prefer DB but fallback to static if empty?
            // Actually, if DB is empty, it returns {}.
            if (Object.keys(dbCategories).length > 0) {
                // We might want to merge with static definitions if DB only has names/slugs but not full metadata yet.
                // But user asked to "use categories in database". So we should trust DB.
                // However, our current static list provides rich metadata that might not be in DB. 
                // Let's assume for this task we merge: DB keys enable the category, Static provides metadata if missing.

                // For simplified "Use DB" request: We will prioritize keys found in DB.
                const merged: Record<string, CategoryData> = {};
                for (const slug in dbCategories) {
                    const dbCat = dbCategories[slug];
                    const staticCat = CATEGORIES[slug] || {};

                    // Robust merge for subcategories
                    const mergedSubcategories: Record<string, CategoryData> = {};

                    // 1. Start with all static subcategories
                    if (staticCat.subcategories) {
                        for (const [subSlug, subData] of Object.entries(staticCat.subcategories)) {
                            mergedSubcategories[subSlug] = subData;
                        }
                    }

                    // 2. Merge/Override with DB subcategories
                    if (dbCat.subcategories) {
                        for (const [subSlug, subData] of Object.entries(dbCat.subcategories)) {
                            // If we already have this subcategory from static, merge it
                            if (mergedSubcategories[subSlug]) {
                                mergedSubcategories[subSlug] = {
                                    ...mergedSubcategories[subSlug],
                                    ...subData,
                                    // Ensure critical fields exist if DB failed to provide them
                                    name: subData.name || mergedSubcategories[subSlug].name || subSlug,
                                    slug: subSlug
                                };
                            } else {
                                // New subcategory only in DB
                                mergedSubcategories[subSlug] = {
                                    ...subData,
                                    name: subData.name || subSlug,
                                    slug: subSlug
                                } as CategoryData;
                            }
                        }
                    }

                    merged[slug] = {
                        ...staticCat,
                        ...dbCat,
                        slug: slug,
                        subcategories: mergedSubcategories
                    };
                }
                CATEGORIES = merged;
            }
            isCategoriesFetched = true;
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    }
    return CATEGORIES;
};

export const getCategoryBySlug = async (slug: string) => {
    await getCategories();
    return CATEGORIES[slug] || null;
};

export const getSubcategoryBySlug = async (categorySlug: string, subcategorySlug: string) => {
    await getCategories();
    const category = CATEGORIES[categorySlug];
    if (!category || !category.subcategories) return null;
    return category.subcategories[subcategorySlug] || null;
};
