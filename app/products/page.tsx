import { getAllProducts } from '@/lib/firestore/products';
import { Metadata } from "next";
import ProductsBrowser from '../components/ProductBrowser';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `Design Custom Apparel | Print Brawl`,
        description: `Browse our collection of premium quality blanks. Ready for your unique designs.`,
    };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const params = await searchParams;
    const allProducts = await getAllProducts();

    return (
        <ProductsBrowser
            initialProducts={allProducts}
            initialCategory={params.category || 'all'}
        />
    );
}