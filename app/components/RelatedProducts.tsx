import Link from 'next/link';
import { getProductsByCategory } from '@/lib/firestore/products';
import RelatedProductsCarousel from './RelatedProductsCarousel';

interface RelatedProductsProps {
    category: string;
    currentProductId: string;
}

export default async function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
    // Fetch more products to allow for scrolling
    const relatedProducts = await getProductsByCategory(category, 12, currentProductId);

    if (!relatedProducts || relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50 py-16 lg:py-24 border-t border-slate-200">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Frequently Sold Together
                    </h2>
                    <Link
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-indigo-600 font-bold text-sm hover:underline hover:text-indigo-700 transition-colors"
                    >
                        View Collection &rarr;
                    </Link>
                </div>

                <RelatedProductsCarousel products={relatedProducts} />
            </div>
        </section>
    );
}
