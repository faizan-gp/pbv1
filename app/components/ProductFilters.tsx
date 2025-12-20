'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProductFilters() {
    const [categories, setCategories] = useState<{ name: string, subcategories: string[] }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const currentSubcategory = searchParams.get('subcategory');

    const toggleCategory = useCallback((category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentCategory === category) {
            params.delete('category');
            params.delete('subcategory');
        } else {
            params.set('category', category);
            params.delete('subcategory');
        }
        router.push(`/products?${params.toString()}`);
    }, [currentCategory, router, searchParams]);

    const toggleSubcategory = useCallback((subcategory: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentSubcategory === subcategory) {
            params.delete('subcategory');
        } else {
            params.set('subcategory', subcategory);
        }
        router.push(`/products?${params.toString()}`);
    }, [currentSubcategory, router, searchParams]);

    const activeCategoryData = categories.find(c => c.name === currentCategory);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Category</h3>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category.name} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={currentCategory === category.name}
                                onChange={() => toggleCategory(category.name)}
                            />
                            <span className={`text-sm transition-colors ${currentCategory === category.name ? 'text-indigo-600 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                {category.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {activeCategoryData && activeCategoryData.subcategories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-left-2 duration-300">
                    <h3 className="text-sm font-medium text-foreground">Subcategory</h3>
                    <div className="space-y-2 pl-2">
                        {activeCategoryData.subcategories.map((sub) => (
                            <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={currentSubcategory === sub}
                                    onChange={() => toggleSubcategory(sub)}
                                />
                                <span className={`text-sm transition-colors ${currentSubcategory === sub ? 'text-indigo-600 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                    {sub}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
