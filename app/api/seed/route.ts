import { NextResponse } from 'next/server';
import { seedProductsBatch } from '@/lib/firestore/products';
import { products } from '@/app/data/products';

export async function GET() {
    try {
        // We are NOT clearing existing products for now with simple firestore utils
        // unless we fetch all and delete, but writeBatch has limits.
        // For now, we will just overwrite/set the seed products.

        // If we really wanted to clear, we'd need to fetch all IDs and delete them.
        // For migration "Seed" usually just means ensure these exist.

        await seedProductsBatch(products);

        return NextResponse.json({ message: 'Database seeded successfully', products });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ message: 'Error seeding database', error }, { status: 500 });
    }
}
