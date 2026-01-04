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
                            <span className="text-sm font-mono tracking-widest text-indigo-600 uppercase">Premium Print-on-Demand</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-indigo-500/50"></div>
                        </div>

                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:leading-tight">
                            We empower creators to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">bring their visions to life.</span>
                        </h1>

                        <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-600 lg:max-w-none lg:grid-cols-2">
                            <div>
                                <p className="text-gray-600">
                                    PrintBrawl isn't just a store; it's a platform for expression. We've partnered with a global network of industry-leading print providers to deliver high-quality custom apparel and products directly to your doorstep.
                                </p>
                                <p className="mt-8">
                                    By utilizing a smart print-on-demand model, we eliminate waste and overproduction. Every item is created only when you order it, ensuring sustainable practices without compromising on premium quality.
                                </p>
                            </div>
                            <div>
                                <p>
                                    Our technology ensures that what you design is what you get. From the digital canvas to the final stitch, we use state-of-the-art Direct-to-Garment (DTG) printing and premium base materials like Bella+Canvas to guarantee retail-ready results.
                                </p>
                                <p className="mt-8 text-gray-900 font-medium">
                                    No inventory. No waste. Just pure creativity.
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
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Details</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Trusted by 100+ production partners worldwide to ensure fast local shipping and reduced carbon footprint.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Quality First</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We rigorously vet our providers. Only the best specialized printing facilities make the cut to handle your designs.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Speed & Scale</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            From single custom pieces to bulk orders, our infrastructure scales with you. Production typically takes just 2-5 days.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-20 pt-10 border-t border-gray-200">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Products Shipped</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">100k+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Happy Creators</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">50k+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                            <dt className="text-xs tracking-widest uppercase text-gray-500">Provider Network</dt>
                            <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl font-mono">90+</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
