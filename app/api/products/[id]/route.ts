import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

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
        await dbConnect();
        const product = await Product.findOne({ id: params.id });

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
        await dbConnect();
        const body = await request.json();

        // Prevent ID modification if it affects the primary key logic provided by client
        // But commonly we might want to update other fields
        const product = await Product.findOneAndUpdate(
            { id: params.id },
            body,
            { new: true, runValidators: true }
        );

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
