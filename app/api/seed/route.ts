import { NextResponse } from 'next/server';
// import { seedProductsBatch, getAllProducts, PRODUCTS_COLLECTION } from '@/lib/firestore/products';
// import { db } from '@/lib/firebase';
// import { writeBatch, doc } from 'firebase/firestore';
// import { products } from '@/app/data/products';

export async function GET() {
    return NextResponse.json({ message: 'Seeding is currently disabled as static product data is missing.' });
    /*
    try {
        // We are NOT clearing existing products for now with simple firestore utils
        // unless we fetch all and delete, but writeBatch has limits.
        // For now, we will just overwrite/set the seed products.

        // If we really wanted to clear, we'd need to fetch all IDs and delete them.
        // For migration "Seed" usually just means ensure these exist.

        // 1. Fetch all existing products
        const existingProducts = await getAllProducts();

        // 2. Delete them (batch delete to be efficient)
        // Since getAllProducts returns data, we might need IDs. 
        // Let's assume we can get IDs or refactor getAllProducts to return docs, 
        // OR we just use a helper if we had one.
        // For now, simpler: loop and delete (dev only). 
        // Actually, let's use writeBatch for deletion too.

        const deleteBatch = writeBatch(db);
        existingProducts.forEach(p => {
            const ref = doc(db, PRODUCTS_COLLECTION, p.id);
            deleteBatch.delete(ref);
        });
        await deleteBatch.commit();

        // 3. Seed new products
        await seedProductsBatch(products);

        return NextResponse.json({ message: 'Database seeded successfully', products });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ message: 'Error seeding database', error }, { status: 500 });
    }
    */
}
