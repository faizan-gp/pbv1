import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, createProduct } from '@/lib/firestore/products';

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

        // Check if ID is changing (Migration)
        if (body.id && body.id !== params.id) {
            console.log(`Migrating product from ${params.id} to ${body.id}`);

            // 1. Check if new ID already exists
            const conflict = await getProductById(body.id);
            if (conflict) {
                return NextResponse.json(
                    { error: 'Cannot rename: Product with new ID already exists' },
                    { status: 409 }
                );
            }

            // 2. Create new product with new ID
            await createProduct(body);

            // 3. Delete old product
            await deleteProduct(params.id);

            // 4. Return new data
            return NextResponse.json({ success: true, data: body });
        }

        // Standard Update
        await updateProduct(params.id, body);

        // Fetch updated to return
        const updatedProduct = await getProductById(params.id);

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
