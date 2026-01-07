
import { getAllCategoriesFromDB } from './firestore/categories';

export interface CategoryData {
    slug: string;
    name: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    parentCategory?: string;
    subcategories?: Record<string, CategoryData>; // Recursive definition for subcategories
}

// Fallback / Static Cache
export let CATEGORIES: Record<string, CategoryData> = {
    'mens-clothing': {
        slug: 'mens-clothing',
        name: "Men's Clothing",
        description: "Elevate your style with premium custom apparel. From heavyweight cotton tees to durable hoodies, our men's collection is built for comfort and print perfection.",
        metaTitle: "Custom Men's Clothing & Apparel | Print Brawl",
        metaDescription: "Design your own men's t-shirts, hoodies, and more. High-quality print-on-demand men's clothing made in the USA.",
        keywords: ["custom mens clothing", "mens custom t-shirts", "custom hoodies for men", "print on demand mens apparel"],
        subcategories: {
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Custom Sweatshirts', metaTitle: '', metaDescription: '', keywords: [] },
            'hoodies': { slug: 'hoodies', name: 'Hoodies', description: 'Custom Hoodies', metaTitle: '', metaDescription: '', keywords: [] },
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'Custom T-shirts', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Custom Long Sleeves', metaTitle: '', metaDescription: '', keywords: [] },
            'tank-tops': { slug: 'tank-tops', name: 'Tank Tops', description: 'Custom Tank Tops', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Custom Sportswear', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Custom Bottoms', metaTitle: '', metaDescription: '', keywords: [] },
            'swimwear': { slug: 'swimwear', name: 'Swimwear', description: 'Custom Swimwear', metaTitle: '', metaDescription: '', keywords: [] },
            'shoes': { slug: 'shoes', name: 'Shoes', description: 'Custom Shoes', metaTitle: '', metaDescription: '', keywords: [] },
            'outerwear': { slug: 'outerwear', name: 'Outerwear', description: 'Custom Outerwear', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'womens-clothing': {
        slug: 'womens-clothing',
        name: "Women's Clothing",
        description: "Discover retail-ready women's fashion. Soft fabrics, modern cuts, and versatile styles waiting for your unique creativity.",
        metaTitle: "Custom Women's Clothing & Apparel | Print Brawl",
        metaDescription: "Create custom women's t-shirts, tank tops, and sweatshirts. Premium quality and fast shipping.",
        keywords: ["custom womens clothing", "womens custom t-shirts", "custom ladies apparel", "print on demand womens fashion"],
        subcategories: {
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Custom Sweatshirts', metaTitle: '', metaDescription: '', keywords: [] },
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'Custom T-shirts', metaTitle: '', metaDescription: '', keywords: [] },
            'hoodies': { slug: 'hoodies', name: 'Hoodies', description: 'Custom Hoodies', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Custom Long Sleeves', metaTitle: '', metaDescription: '', keywords: [] },
            'tank-tops': { slug: 'tank-tops', name: 'Tank Tops', description: 'Custom Tank Tops', metaTitle: '', metaDescription: '', keywords: [] },
            'skirts-dresses': { slug: 'skirts-dresses', name: 'Skirts & Dresses', description: 'Custom Skirts & Dresses', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Custom Sportswear', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Custom Bottoms', metaTitle: '', metaDescription: '', keywords: [] },
            'swimwear': { slug: 'swimwear', name: 'Swimwear', description: 'Custom Swimwear', metaTitle: '', metaDescription: '', keywords: [] },
            'shoes': { slug: 'shoes', name: 'Shoes', description: 'Custom Shoes', metaTitle: '', metaDescription: '', keywords: [] },
            'outerwear': { slug: 'outerwear', name: 'Outerwear', description: 'Custom Outerwear', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'kids-clothing': {
        slug: 'kids-clothing',
        name: "Kids' Clothing",
        description: "Durable, soft, and play-ready. Our kids' collection features safe, comfortable fabrics perfect for little ones and their big adventures.",
        metaTitle: "Custom Kids' Clothing | Print Brawl",
        metaDescription: "Design custom t-shirts and hoodies for kids. Safe, durable, and comfortable.",
        keywords: ["custom kids clothing", "kids t-shirts", "custom baby clothes"],
        subcategories: {
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'Custom T-shirts', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Custom Long Sleeves', metaTitle: '', metaDescription: '', keywords: [] },
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Custom Sweatshirts', metaTitle: '', metaDescription: '', keywords: [] },
            'baby-clothing': { slug: 'baby-clothing', name: 'Baby Clothing', description: 'Custom Baby Clothing', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Custom Sportswear', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Custom Bottoms', metaTitle: '', metaDescription: '', keywords: [] },
            'other': { slug: 'other', name: 'Other', description: 'Other Kids Clothing', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'accessories': {
        slug: 'accessories',
        name: "Accessories",
        description: "The perfect finishing touches. Personalize everything from tote bags and hats to phone cases with high-quality printing.",
        metaTitle: "Custom Accessories | Print Brawl",
        metaDescription: "Create custom accessories. Phone cases, bags, hats, and more.",
        keywords: ["custom accessories", "custom phone cases", "custom bags"],
        subcategories: {
            'jewelry': { slug: 'jewelry', name: 'Jewelry', description: 'Custom Jewelry', metaTitle: '', metaDescription: '', keywords: [] },
            'phone-cases': { slug: 'phone-cases', name: 'Phone Cases', description: 'Custom Phone Cases', metaTitle: '', metaDescription: '', keywords: [] },
            'bags': { slug: 'bags', name: 'Bags', description: 'Custom Bags', metaTitle: '', metaDescription: '', keywords: [] },
            'socks': { slug: 'socks', name: 'Socks', description: 'Custom Socks', metaTitle: '', metaDescription: '', keywords: [] },
            'hats': { slug: 'hats', name: 'Hats', description: 'Custom Hats', metaTitle: '', metaDescription: '', keywords: [] },
            'underwear': { slug: 'underwear', name: 'Underwear', description: 'Custom Underwear', metaTitle: '', metaDescription: '', keywords: [] },
            'baby-accessories': { slug: 'baby-accessories', name: 'Baby Accessories', description: 'Custom Baby Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'mouse-pads': { slug: 'mouse-pads', name: 'Mouse Pads', description: 'Custom Mouse Pads', metaTitle: '', metaDescription: '', keywords: [] },
            'pets': { slug: 'pets', name: 'Pets', description: 'Custom Pets', metaTitle: '', metaDescription: '', keywords: [] },
            'kitchen-accessories': { slug: 'kitchen-accessories', name: 'Kitchen Accessories', description: 'Custom Kitchen Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'car-accessories': { slug: 'car-accessories', name: 'Car Accessories', description: 'Custom Car Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'tech-accessories': { slug: 'tech-accessories', name: 'Tech Accessories', description: 'Custom Tech Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'travel-accessories': { slug: 'travel-accessories', name: 'Travel Accessories', description: 'Custom Travel Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'stationery-accessories': { slug: 'stationery-accessories', name: 'Stationery Accessories', description: 'Custom Stationery Accessories', metaTitle: '', metaDescription: '', keywords: [] },
            'sports-games': { slug: 'sports-games', name: 'Sports & Games', description: 'Custom Sports & Games', metaTitle: '', metaDescription: '', keywords: [] },
            'face-masks': { slug: 'face-masks', name: 'Face Masks', description: 'Custom Face Masks', metaTitle: '', metaDescription: '', keywords: [] },
            'other': { slug: 'other', name: 'Other', description: 'Other Accessories', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'home-living': {
        slug: 'home-living',
        name: "Home & Living",
        description: "Transform your space. Custom printed mugs, pillows, and decor that turn houses into homes with your personal artistic flair.",
        metaTitle: "Custom Home Decor | Print Brawl",
        metaDescription: "Design your own home decor. Mugs, pillows, blankets, and more.",
        keywords: ["custom home decor", "custom mugs", "custom pillows"],
        subcategories: {
            'mugs': { slug: 'mugs', name: 'Mugs', description: 'Custom Mugs', metaTitle: '', metaDescription: '', keywords: [] },
            'candles': { slug: 'candles', name: 'Candles', description: 'Custom Candles', metaTitle: '', metaDescription: '', keywords: [] },
            'ornaments': { slug: 'ornaments', name: 'Ornaments', description: 'Custom Ornaments', metaTitle: '', metaDescription: '', keywords: [] },
            'seasonal-decorations': { slug: 'seasonal-decorations', name: 'Seasonal Decorations', description: 'Custom Seasonal Decorations', metaTitle: '', metaDescription: '', keywords: [] },
            'glassware': { slug: 'glassware', name: 'Glassware', description: 'Custom Glassware', metaTitle: '', metaDescription: '', keywords: [] },
            'bottles-tumblers': { slug: 'bottles-tumblers', name: 'Bottles & Tumblers', description: 'Custom Bottles & Tumblers', metaTitle: '', metaDescription: '', keywords: [] },
            'canvas': { slug: 'canvas', name: 'Canvas', description: 'Custom Canvas', metaTitle: '', metaDescription: '', keywords: [] },
            'posters': { slug: 'posters', name: 'Posters', description: 'Custom Posters', metaTitle: '', metaDescription: '', keywords: [] },
            'postcards': { slug: 'postcards', name: 'Postcards', description: 'Custom Postcards', metaTitle: '', metaDescription: '', keywords: [] },
            'journals-notebooks': { slug: 'journals-notebooks', name: 'Journals & Notebooks', description: 'Custom Journals & Notebooks', metaTitle: '', metaDescription: '', keywords: [] },
            'magnets-stickers': { slug: 'magnets-stickers', name: 'Magnets & Stickers', description: 'Custom Magnets & Stickers', metaTitle: '', metaDescription: '', keywords: [] },
            'home-decor': { slug: 'home-decor', name: 'Home Decor', description: 'Custom Home Decor', metaTitle: '', metaDescription: '', keywords: [] },
            'blankets': { slug: 'blankets', name: 'Blankets', description: 'Custom Blankets', metaTitle: '', metaDescription: '', keywords: [] },
            'pillows-covers': { slug: 'pillows-covers', name: 'Pillows & Covers', description: 'Custom Pillows & Covers', metaTitle: '', metaDescription: '', keywords: [] },
            'towels': { slug: 'towels', name: 'Towels', description: 'Custom Towels', metaTitle: '', metaDescription: '', keywords: [] },
            'bathroom': { slug: 'bathroom', name: 'Bathroom', description: 'Custom Bathroom', metaTitle: '', metaDescription: '', keywords: [] },
            'rugs-mats': { slug: 'rugs-mats', name: 'Rugs & Mats', description: 'Custom Rugs & Mats', metaTitle: '', metaDescription: '', keywords: [] },
            'bedding': { slug: 'bedding', name: 'Bedding', description: 'Custom Bedding', metaTitle: '', metaDescription: '', keywords: [] },
            'food-health-beauty': { slug: 'food-health-beauty', name: 'Food - Health - Beauty', description: 'Custom Food - Health - Beauty', metaTitle: '', metaDescription: '', keywords: [] }
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
                        // Ensure critical fields exist and prefer static/enriched data if DB data is empty
                        name: staticCat.name || dbCat.name || slug,
                        description: dbCat.description || staticCat.description || "",
                        metaTitle: dbCat.metaTitle || staticCat.metaTitle || "",
                        metaDescription: dbCat.metaDescription || staticCat.metaDescription || "",
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
