import { NextResponse } from 'next/server';
import { getAllCategoriesFromDB, createCategory, seedCategoriesBatch, updateCategory, getAllRawCategories, deleteCategory } from '@/lib/firestore/categories';

// Seed Data from User's Image
const SEED_DATA = [
    {
        name: "Men's Clothing",
        description: "Elevate your style with premium custom apparel. From heavyweight cotton tees to durable hoodies, our men's collection is built for comfort and print perfection.",
        subcategories: ["Sweatshirts", "Hoodies", "T-shirts", "Long Sleeves", "Tank Tops", "Sportswear", "Bottoms", "Swimwear", "Shoes", "Outerwear"]
    },
    {
        name: "Women's Clothing",
        description: "Discover retail-ready women's fashion. Soft fabrics, modern cuts, and versatile styles waiting for your unique creativity.",
        subcategories: ["Sweatshirts", "T-shirts", "Hoodies", "Long Sleeves", "Tank Tops", "Skirts & Dresses", "Sportswear", "Bottoms", "Swimwear", "Shoes", "Outerwear"]
    },
    {
        name: "Kids' Clothing",
        description: "Durable, soft, and play-ready. Our kids' collection features safe, comfortable fabrics perfect for little ones and their big adventures.",
        subcategories: ["T-shirts", "Long Sleeves", "Sweatshirts", "Baby Clothing", "Sportswear", "Bottoms", "Other"]
    },
    {
        name: "Accessories",
        description: "The perfect finishing touches. Personalize everything from tote bags and hats to phone cases with high-quality printing.",
        subcategories: ["Jewelry", "Phone Cases", "Bags", "Socks", "Hats", "Underwear", "Baby Accessories", "Mouse Pads", "Pets", "Kitchen Accessories", "Car Accessories", "Tech Accessories", "Travel Accessories", "Stationery Accessories", "Sports & Games", "Face Masks", "Other"]
    },
    {
        name: "Home & Living",
        description: "Transform your space. Custom printed mugs, pillows, and decor that turn houses into homes with your personal artistic flair.",
        subcategories: ["Mugs", "Candles", "Ornaments", "Seasonal Decorations", "Glassware", "Bottles & Tumblers", "Canvas", "Posters", "Postcards", "Journals & Notebooks", "Magnets & Stickers", "Home Decor", "Blankets", "Pillows & Covers", "Towels", "Bathroom", "Rugs & Mats", "Bedding", "Food - Health - Beauty"]
    }
];

export async function GET(req: Request) {
    try {
        let categories = await getAllCategoriesFromDB();

        // Auto-seed if empty
        if (Object.keys(categories).length === 0) {
            await seedCategoriesBatch(SEED_DATA);
            // Re-fetch to return the standard Record format
            categories = await getAllCategoriesFromDB();
        } else {
            // Self-healing: Check for missing descriptions and update if needed
            const updates = [];
            for (const seedCat of SEED_DATA) {
                const slugCandidate = seedCat.name.toLowerCase().replace(/['&]/g, '').replace(/\s+/g, '-');
                const dbCat = categories[slugCandidate];

                if (dbCat) {
                    const needsDescriptionUpdate = !dbCat.description;
                    const needsNameUpdate = dbCat.name === slugCandidate || dbCat.name.toLowerCase() === slugCandidate;
                    const needsSubcategories = !dbCat.subcategories || Object.keys(dbCat.subcategories).length === 0;

                    if (needsDescriptionUpdate || needsNameUpdate || needsSubcategories) {
                        const updateData: any = {};
                        if (needsDescriptionUpdate) {
                            console.log(`Migrating description for ${seedCat.name}...`);
                            updateData.description = seedCat.description;
                        }
                        if (needsNameUpdate) {
                            console.log(`Fixing name for ${seedCat.name}...`);
                            updateData.name = seedCat.name;
                        }
                        if (needsSubcategories) {
                            console.log(`Restoring subcategories for ${seedCat.name}...`);
                            const subcategoriesMap: Record<string, any> = {};
                            const slugify = (text: string) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

                            seedCat.subcategories.forEach(subName => {
                                const subSlug = slugify(subName);
                                subcategoriesMap[subSlug] = {
                                    slug: subSlug,
                                    name: subName,
                                    description: `Custom ${subName}`,
                                    metaTitle: `${subName} | Print Brawl`,
                                    metaDescription: `Shop custom ${subName}`,
                                    keywords: [subName, `custom ${subName}`],
                                };
                            });
                            updateData.subcategories = subcategoriesMap;
                        }

                        updates.push(updateCategory(slugCandidate, updateData));
                    }
                }
            }
            if (updates.length > 0) {
                await Promise.all(updates);
                categories = await getAllCategoriesFromDB();
            }
        }

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, subcategories } = body;
        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        const id = await createCategory({ name, subcategories: subcategories || [] });
        return NextResponse.json({ success: true, data: { id, name, subcategories } });
    } catch (error) {
        console.error("Category create error:", error);
        return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }
}
