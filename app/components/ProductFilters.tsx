'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Clothing",
    "Accessories",
    "Home & Living",
];

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    const toggleCategory = useCallback((category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentCategory === category) {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        router.push(`/products?${params.toString()}`);
    }, [currentCategory, router, searchParams]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Category</h3>
                <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={currentCategory === category}
                                onChange={() => toggleCategory(category)}
                            />
                            <span className={`text-sm transition-colors ${currentCategory === category ? 'text-indigo-600 font-medium' : 'text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'}`}>
                                {category}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
