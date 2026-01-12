import React, { Suspense } from 'react';
import CategoryGrid from '@/app/components/categories/CategoryGrid';

export const metadata = {
    title: 'Collections',
    description: 'Explore our premium categories ready for your custom designs.'
};

function CategoryGridSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 relative z-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 rounded-[2.5rem] bg-slate-50 border border-slate-100 animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <div className="bg-white min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-24">

            {/* --- HERO SECTION (Exact Match to About Page) --- */}
            <div className="relative isolate overflow-hidden pt-14 pb-24 sm:pb-32">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />
                <div className="absolute inset-0 -z-20 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                            Our Collections
                        </div>
                        <h1 className="mt-2 text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:leading-tight">
                            Start With the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                                Perfect Canvas.
                            </span>
                        </h1>
                        <p className="mt-8 text-xl text-slate-600 leading-relaxed max-w-2xl">
                            Explore our premium base products. From retail-quality apparel to durable home goods, everything is ready for your unique touch.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CATEGORY GRID --- */}
            <Suspense fallback={<CategoryGridSkeleton />}>
                <CategoryGrid />
            </Suspense>

            {/* --- STATS / TRUST SECTION (Matches About Page) --- */}
            <div className="border-t border-slate-100 bg-slate-50/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Quality</dt>
                            <dd className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Retail Grade</dd>
                            <dd className="text-sm text-slate-400">Bella+Canvas & Gildan</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Printing</dt>
                            <dd className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">DTG Tech</dd>
                            <dd className="text-sm text-slate-400">Eco-friendly Inks</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Shipping</dt>
                            <dd className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Global</dd>
                            <dd className="text-sm text-slate-400">Tracked Delivery</dd>
                        </div>
                    </dl>
                </div>
            </div>

        </div>
    );
}