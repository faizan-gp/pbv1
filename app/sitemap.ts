import { MetadataRoute } from 'next';
import { getAllProducts, Product } from '@/lib/firestore/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.printbrawl.com';

    // Get all products dynamically
    let products: Product[] = [];
    try {
        products = await getAllProducts();
    } catch (error) {
        console.error('Failed to fetch products for sitemap:', error);
    }

    // Map products to sitemap entries
    const productEntries = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(), // Ideally this would come from the product data
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.5,
        },
    ];

    return [...staticPages, ...productEntries];
}
