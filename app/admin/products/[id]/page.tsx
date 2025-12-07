import ProductCreator from '@/app/components/ProductCreator';
import { IProduct } from '@/models/Product';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findOne({ id }).lean();
    if (!product) return null;

    // Serialize MongoDB document to plain JSON to pass to client component
    return JSON.parse(JSON.stringify(product));
}

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AdminEditProductPage(props: Props) {
    const params = await props.params;
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
            <ProductCreator initialData={product} isEditing={true} />
        </div>
    );
}
