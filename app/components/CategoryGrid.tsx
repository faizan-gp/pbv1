
import Link from 'next/link';
import { ALL_CATEGORIES } from '@/lib/categories';
import { ArrowRight } from 'lucide-react';

export default function CategoryGrid() {
    // Filter out top-level categories if needed, or just display selected ones.
    // For now, displaying all main categories from the static list.
    const categories = ALL_CATEGORIES;

    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-16 lg:py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
                        Explore More Collections
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Discover more premium custom apparel and accessories.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className="group relative flex flex-col overflow-hidden rounded-3xl bg-slate-50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 block h-64 md:h-80"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />

                            {/* Simple placeholder gradient if no main image, or use category specific images if available in future */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:scale-105 transition-transform duration-700`} />

                            <div className="absolute bottom-0 p-8 z-20 w-full">
                                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                    {category.name}
                                </h3>
                                <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                                    Browse Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
