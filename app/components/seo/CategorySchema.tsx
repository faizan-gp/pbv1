
import { CategoryData } from '@/lib/categories';
import { Product } from '@/lib/firestore/products';

export default function CategorySchema({ category, products }: { category: CategoryData; products: Product[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.name,
        "description": category.description || `Custom ${category.name}`,
        "url": `https://www.printbrawl.com/categories/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": products.length,
            "itemListElement": products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://www.printbrawl.com/products/${product.id}`,
                "name": product.name,
                "image": product.image || product.listingImages?.[0]?.url || ""
            }))
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
