import { NextResponse } from 'next/server';
import { getAllCategoriesFromDB, createCategory, seedCategoriesBatch } from '@/lib/firestore/categories';

// Seed Data from User's Image
const SEED_DATA = [
    {
        name: "Men's Clothing",
        subcategories: ["Sweatshirts", "Hoodies", "T-shirts", "Long Sleeves", "Tank Tops", "Sportswear", "Bottoms", "Swimwear", "Shoes", "Outerwear"]
    },
    {
        name: "Women's Clothing",
        subcategories: ["Sweatshirts", "T-shirts", "Hoodies", "Long Sleeves", "Tank Tops", "Skirts & Dresses", "Sportswear", "Bottoms", "Swimwear", "Shoes", "Outerwear"]
    },
    {
        name: "Kids' Clothing",
        subcategories: ["T-shirts", "Long Sleeves", "Sweatshirts", "Baby Clothing", "Sportswear", "Bottoms", "Other"]
    },
    {
        name: "Accessories",
        subcategories: ["Jewelry", "Phone Cases", "Bags", "Socks", "Hats", "Underwear", "Baby Accessories", "Mouse Pads", "Pets", "Kitchen Accessories", "Car Accessories", "Tech Accessories", "Travel Accessories", "Stationery Accessories", "Sports & Games", "Face Masks", "Other"]
    },
    {
        name: "Home & Living",
        subcategories: ["Mugs", "Candles", "Ornaments", "Seasonal Decorations", "Glassware", "Bottles & Tumblers", "Canvas", "Posters", "Postcards", "Journals & Notebooks", "Magnets & Stickers", "Home Decor", "Blankets", "Pillows & Covers", "Towels", "Bathroom", "Rugs & Mats", "Bedding", "Food - Health - Beauty"]
    }
];

export async function GET() {
    try {
        let categories = await getAllCategoriesFromDB();
        // Auto-seed if empty
        if (Object.keys(categories).length === 0) {
            await seedCategoriesBatch(SEED_DATA);
            // Re-fetch to return the standard Record format
            categories = await getAllCategoriesFromDB();
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
