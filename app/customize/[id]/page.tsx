import ProductCustomizer from '../../components/ProductCustomizer';
import ShirtConfigurator from '../../components/ShirtConfigurator';
import Product from '@/models/Product';
import dbConnect from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from "next";

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findOne({ id }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = await getProduct(params.id);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `Customize ${product.name} | PrintBrawl`,
        description: `Create your custom ${product.name} design.`,
    };
}

export default async function CustomizePage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    if (product.id === 't-shirt-standard') {
        return <ShirtConfigurator product={product} />;
    }

    return (
        <div className="container-width py-12">
            <ProductCustomizer product={product} />
        </div>
    );
}
