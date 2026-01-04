import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { Globe2, Sparkles, Leaf, Zap, Award, Shirt } from 'lucide-react';

export const metadata: Metadata = {
    title: "About Us | Driven by Creativity, Powered by Printify",
    description: "Print Brawl combines innovative design tools with Printify's global fulfillment network to deliver premium custom apparel directly to your door.",
    openGraph: {
        title: "About Print Brawl | Creativity Meets Quality",
        description: "We partner with the world's best print providers to bring your custom designs to life.",
    }
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-24">

            {/* --- HERO SECTION --- */}
            <div className="relative isolate overflow-hidden pt-14 pb-24 sm:pb-32">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />
                <div className="absolute inset-0 -z-20 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                            Our Story
                        </div>
                        <h1 className="mt-2 text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:leading-tight">
                            Designed by You.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                                Printed by the Best.
                            </span>
                        </h1>
                        <p className="mt-8 text-xl text-slate-600 leading-relaxed max-w-2xl">
                            Print Brawl exists to bridge the gap between your imagination and reality. We provide the powerful design tools; our global partners handle the rest.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- PARTNERSHIP SECTION (The "Printify" Reveal) --- */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 relative z-10">
                <div className="rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                    {/* Dark/Space Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[100px]"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider mb-6 border border-green-500/20">
                                Trusted Partnership
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                Powered by <span className="text-green-400">Printify</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                To ensure every item you create meets the highest standards, we've partnered with <strong>Printify</strong>—the world's most robust print-on-demand network.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-slate-200">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        <Globe2 size={12} />
                                    </div>
                                    <div>
                                        <strong className="text-white block">Global Fulfillment</strong>
                                        <span className="text-sm text-slate-400">90+ print facilities worldwide means faster shipping and lower impact.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-slate-200">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Award size={12} />
                                    </div>
                                    <div>
                                        <strong className="text-white block">Premium Brands Only</strong>
                                        <span className="text-sm text-slate-400">We print on Bella+Canvas, Gildan 5000, and other retail-grade fabrics.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-slate-200">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                        <Zap size={12} />
                                    </div>
                                    <div>
                                        <strong className="text-white block">Quality Control</strong>
                                        <span className="text-sm text-slate-400">Rigorous checks ensure your custom design looks exactly how you imagined.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Visual Representation */}
                        <div className="relative">
                            <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                                {/* Simple diagram */}
                                <div className="text-center space-y-8 relative w-full">
                                    {/* Connection Lines */}
                                    <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500 via-white/50 to-green-500 -translate-x-1/2 -z-10 dashed-line"></div>

                                    <div className="bg-white p-4 rounded-2xl shadow-lg w-48 mx-auto relative z-10">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">You Create</div>
                                        <div className="text-indigo-600 font-black text-xl">Design</div>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto relative z-10 text-xs font-bold">VS</div>

                                    <div className="bg-white p-4 rounded-2xl shadow-lg w-48 mx-auto relative z-10 border-2 border-green-500/20">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Partners Print</div>
                                        <div className="text-green-600 font-black text-xl">Fulfill</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- VALUES GRID --- */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-40">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why Create With Us?</h2>
                    <p className="mt-6 text-lg text-slate-600">
                        We're not just another t-shirt shop. We're a technology company that empowers you to be the brand.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {/* Card 1 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 h-full flex flex-col">
                        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Limitless Creativity</h3>
                        <p className="text-slate-600 leading-relaxed flex-grow">
                            Our design studio allows for photorealistic previews. What you see on screen is what arrives at your door. No nasty surprises.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 h-full flex flex-col">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Leaf size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Sustainable Model</h3>
                        <p className="text-slate-600 leading-relaxed flex-grow">
                            We only print what you buy. This means zero overproduction and zero waste compared to traditional fashion retail.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 h-full flex flex-col">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shirt size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Retail Quality</h3>
                        <p className="text-slate-600 leading-relaxed flex-grow">
                            We use DTG (Direct-to-Garment) technology that fuses ink into the fabric, making the print soft, breathable, and durable.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- STATS --- */}
            <div className="border-y border-slate-100 bg-slate-50/50 mt-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-32">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Happy Creators</dt>
                            <dd className="order-first text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">50,000+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Unique Designs</dt>
                            <dd className="order-first text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">1M+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-sm leading-7 text-slate-600 uppercase tracking-widest font-semibold">Print Providers</dt>
                            <dd className="order-first text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">90+</dd>
                        </div>
                    </dl>
                </div>
            </div>

        </div>
    );
}
