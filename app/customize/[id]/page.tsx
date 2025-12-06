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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `Customize ${product.name} | PrintBrawl`,
        description: `Create your custom ${product.name} design.`,
    };
}

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return <ShirtConfigurator product={product} />;
}
