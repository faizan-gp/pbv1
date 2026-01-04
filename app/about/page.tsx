import React from 'react';
import Image from 'next/image';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us | Print Brawl - Premium Print on Demand",
    description: "Learn about Print Brawl's mission to empower creators with high-quality, sustainable custom apparel printing. No inventory, retail-ready quality.",
    openGraph: {
        title: "About Print Brawl | Empowering Creators",
        description: "We partner with global print providers to deliver high-quality custom products. Zero waste, premium materials.",
    }
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-sans">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden pt-14 border-b border-gray-200">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />

                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                        <div className="flex items-center gap-x-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-indigo-500/50"></div>
                            <span className="text-sm font-mono tracking-widest text-indigo-600 uppercase">Design Your Own Style</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-indigo-500/50"></div>
                        </div>

                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:leading-tight">
                            Wear your imagination. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Create something uniquely yours.</span>
                        </h1>

                        <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-600 lg:max-w-none lg:grid-cols-2">
                            <div>
                                <p className="text-gray-600">
                                    PrintBrawl is your creative playground. We believe that everyone deserves to wear clothes that truly represent who they are. Whether it's an inside joke, a family photo, or a piece of art you created, we help you turn your ideas into high-quality apparel.
                                </p>
                                <p className="mt-8">
                                    Forget generic store-bought designs. With our easy-to-use design studio, you can make one-of-a-kind t-shirts, hoodies, and gifts in minutes. It's not about bulk orders or business—it's about expressing yourself.
                                </p>
                            </div>
                            <div>
                                <p>
                                    We use the same premium materials and printing technology as top retail brands, ensuring your custom creation looks and feels amazing. From the first click to the final unboxing, we're dedicated to delivering a product you'll love to wear or proud to give.
                                </p>
                                <p className="mt-8 text-gray-900 font-medium">
                                    No minimums. No limits. Just your creativity, brought to life.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Uniquely You</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Express your personality with custom designs that you won't find on any rack. Perfect for making a statement or preserving a memory.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Perfect Gifts</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Create thoughtful, personalized gifts for birthdays, holidays, or special occasions. Give something that shows you care.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We don't compromise on quality. We use soft, durable fabrics and high-definition printing to ensure your design looks perfect.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-20 pt-10 border-t border-gray-200">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Unique Designs Created</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">100k+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Happy Customers</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">50k+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Star Rating</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">4.9/5</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
