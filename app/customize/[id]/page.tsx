import { getProductById } from '@/lib/firestore/products';
import { notFound } from 'next/navigation';
import { Metadata } from "next";
import ShirtConfigurator from '../../components/ShirtConfigurator';

async function getProduct(id: string) {
    const product = await getProductById(id);
    if (!product) return null;
    return product;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `Studio: Customize ${product.name} | PrintBrawl`,
        description: `Create your custom ${product.name} design.`,
    };
}

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white">
            {/* Global Noise Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            <ShirtConfigurator product={product} />
        </div>
    );
}