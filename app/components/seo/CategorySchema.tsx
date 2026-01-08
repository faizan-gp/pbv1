
import { CategoryData } from '@/lib/categories';

export default function CategorySchema({ category }: { category: CategoryData }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.name,
        "description": category.description || `Custom ${category.name}`,
        "url": `https://www.printbrawl.com/categories/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
