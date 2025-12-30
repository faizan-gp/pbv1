import { NextResponse } from 'next/server';
import { getProductById, updateProduct } from '@/lib/firestore/products';

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    props: Props
) {
    const params = await props.params;
    try {
        const product = await getProductById(params.id);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: Props
) {
    const params = await props.params;
    try {
        const body = await request.json();
        console.log('Received UPDATE body:', JSON.stringify(body, null, 2));

        // Start with checking existence
        const existingProduct = await getProductById(params.id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Update in Firestore
        await updateProduct(params.id, body);

        // Fetch updated to return
        const updatedProduct = await getProductById(params.id);

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
