import ProductCreator from '@/app/components/ProductCreator';
import { getProductById } from '@/lib/firestore/products';
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
    return await getProductById(id);
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
