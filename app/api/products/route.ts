import { NextResponse } from 'next/server';
import { getAllProducts, createProduct, getProductById } from '@/lib/firestore/products';


export async function GET() {
    try {
        const products = await getAllProducts();

        return NextResponse.json(
            { success: true, data: products },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                    'CDN-Cache-Control': 'public, s-maxage=300',
                },
            }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.id || !body.name) {
            return NextResponse.json(
                { error: 'Product ID and Name are required' },
                { status: 400 }
            );
        }

        const existingProduct = await getProductById(body.id);
        if (existingProduct) {
            return NextResponse.json(
                { error: 'Product with this ID already exists' },
                { status: 400 }
            );
        }

        await createProduct(body);

        return NextResponse.json({ success: true, data: body }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', details: error.message },
            { status: 500 }
        );
    }
}
