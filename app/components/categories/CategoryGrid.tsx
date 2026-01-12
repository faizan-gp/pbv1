
import Link from 'next/link';
import { getCategories } from '@/lib/categories';
import {
    Shirt, Scissors, Baby, ShoppingBag, Home as HomeIcon,
    ArrowRight, Star, Zap
} from 'lucide-react';

// --- CONFIG ---
// Map category slugs to specific icons and colors to match your theme
const CATEGORY_CONFIG: Record<string, { icon: any, color: string, bg: string, accent: string }> = {
    'mens-clothing': {
        icon: Shirt,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        accent: 'group-hover:shadow-indigo-500/10'
    },
    'womens-clothing': {
        icon: Scissors,
        color: 'text-fuchsia-600',
        bg: 'bg-fuchsia-50',
        accent: 'group-hover:shadow-fuchsia-500/10'
    },
    'kids-clothing': {
        icon: Baby,
        color: 'text-green-600',
        bg: 'bg-green-50',
        accent: 'group-hover:shadow-green-500/10'
    },
    'accessories': {
        icon: ShoppingBag,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        accent: 'group-hover:shadow-amber-500/10'
    },
    'home-living': {
        icon: HomeIcon,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        accent: 'group-hover:shadow-cyan-500/10'
    },
    'default': {
        icon: Star,
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        accent: 'group-hover:shadow-slate-500/10'
    }
};

export default async function CategoryGrid() {
    const categories = await getCategories();
    const categoryList = Object.values(categories);

    return (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 relative z-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">

                {categoryList.map((cat) => {
                    const style = CATEGORY_CONFIG[cat.slug] || CATEGORY_CONFIG['default'];
                    const Icon = style.icon;

                    return (
                        <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            className={`group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl ${style.accent} transition-all duration-300 h-full flex flex-col relative overflow-hidden`}
                        >
                            {/* Hover Gradient Effect */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

                            {/* Icon */}
                            <div className={`w-16 h-16 ${style.bg} ${style.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                                <Icon size={32} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                                {cat.name}
                            </h2>
                            <p className="text-slate-500 leading-relaxed mb-8 flex-grow font-medium">
                                {cat.description || "Premium quality blanks ready for your custom design. High durability and perfect print surface."}
                            </p>

                            {/* Action */}
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900 group-hover:text-indigo-600 transition-colors">
                                Browse Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}

                {/* --- "ALL PRODUCTS" CARD (Dark Style from About Page Partnership Section) --- */}
                <Link
                    href="/products"
                    className="group relative p-8 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-xl ring-1 ring-white/10 flex flex-col justify-between"
                >
                    {/* Dark Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[80px] group-hover:bg-purple-500/40 transition-colors duration-500"></div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider mb-6 border border-green-500/20">
                            Full Catalog
                        </div>
                        <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                            Can't decide? <br />
                            <span className="text-green-400">View Everything.</span>
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            Browse our entire inventory of 100+ customizable products in one place.
                        </p>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-white font-bold">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-slate-900 transition-all">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <span>Shop All Products</span>
                    </div>
                </Link>

            </div>
        </div>
    );
}
