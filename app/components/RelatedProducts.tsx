
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/firestore/products';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
    category: string;
    currentProductId: string;
}

export default async function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
    const relatedProducts = await getProductsByCategory(category, 4, currentProductId);

    if (!relatedProducts || relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50 py-16 lg:py-24 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        You May Also Like
                    </h2>
                    <Link
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-indigo-600 font-bold text-sm hover:underline hover:text-indigo-700 transition-colors"
                    >
                        View Collection &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {relatedProducts.map(product => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
