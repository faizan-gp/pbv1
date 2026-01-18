import { getAllProducts } from '@/lib/firestore/products';
import { Metadata } from "next";
import ProductsBrowser from '../components/ProductBrowser';

// ISR: Revalidate products listing page every 30 minutes (1800 seconds)
export const revalidate = 1800;

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