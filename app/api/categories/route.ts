import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

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
    await dbConnect();
    try {
        const categories = await Category.find({});
        // Auto-seed if empty
        if (categories.length === 0) {
            await Category.insertMany(SEED_DATA);
            return NextResponse.json({ success: true, data: SEED_DATA });
        }
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, subcategories } = body;

        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });

        const category = await Category.create({ name, subcategories: subcategories || [] });
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }
}
