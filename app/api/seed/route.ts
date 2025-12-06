import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { products } from '@/app/data/products';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing products
        await Product.deleteMany({});

        // Insert initial products
        await Product.create(products);

        return NextResponse.json({ message: 'Database seeded successfully', products });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ message: 'Error seeding database', error }, { status: 500 });
    }
}
