import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';


export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ _id: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation could go here, but Mongoose schema handles most of it
        // Ensure ID is unique or generate one if not provided (though our frontend provides it based on name)

        const existingProduct = await Product.findOne({ id: body.id });
        if (existingProduct) {
            return NextResponse.json(
                { error: 'Product with this ID already exists' },
                { status: 400 }
            );
        }

        const product = await Product.create(body);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', details: error.message },
            { status: 500 }
        );
    }
}
