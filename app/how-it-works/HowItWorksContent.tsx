'use client';

import Link from "next/link";
import {
    ArrowRight, ShoppingBag, Palette, Truck, CheckCircle2,
    Layers, MousePointerClick, MapPin, Package, Clock
} from "lucide-react";

export default function HowItWorksContent() {
    return (
        <div className="relative bg-white min-h-screen pt-32 pb-24 overflow-hidden selection:bg-indigo-500 selection:text-white">

            {/* --- GLOBAL BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] opacity-50"></div>
            </div>

            {/* --- HEADER --- */}
            <div className="container-width text-center max-w-4xl mx-auto mb-32 px-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-6">
                    Simple Process
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8">
                    From Idea to Reality<br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        in 3 Simple Steps.
                    </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
                    Creating something unique shouldn't be complicated. We've made it easy for you to design custom apparel that you'll love to wear.
                </p>
            </div>

            {/* --- STEPS CONTAINER --- */}
            <div className="container-width px-4 relative z-10">
                <div className="relative">

                    {/* CONNECTING LINE (THE SPINE) */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 -translate-x-1/2 z-0"></div>

                    {/* --- STEP 1: PICK PRODUCT --- */}
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">

                        {/* Connector Node (Desktop) */}
                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-blue-100 rounded-full items-center justify-center shadow-sm z-20">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        </div>

                        {/* Text Content */}
                        <div className="lg:text-right order-2 lg:order-1 lg:pr-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
                                <ShoppingBag className="w-4 h-4" /> Step 01
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Find Your Perfect Fit</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Choose from our collection of high-quality tees, hoodies, and accessories. We've hand-picked products that feel great and hold prints perfectly.
                            </p>
                            <ul className="flex flex-col gap-3 lg:items-end">
                                <li className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-fit">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Premium Brands
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-fit">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Super Soft Fabrics
                                </li>
                            </ul>
                        </div>

                        {/* Visual: Floating Card Stack */}
                        <div className="lg:pl-20 order-1 lg:order-2 perspective-[1000px]">
                            <div className="relative h-[400px] w-full bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)]"></div>

                                {/* Floating Product Cards */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white rounded-2xl shadow-xl border border-slate-100 transform -rotate-6 transition-transform duration-500 group-hover:-rotate-12 group-hover:translate-x-[-20px] z-10 flex flex-col p-4">
                                    <div className="flex-1 bg-slate-100 rounded-lg mb-4"></div>
                                    <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white rounded-2xl shadow-xl border border-slate-100 transform rotate-6 transition-transform duration-500 group-hover:rotate-12 group-hover:translate-x-[20px] z-20 flex flex-col p-4">
                                    <div className="flex-1 bg-slate-100 rounded-lg mb-4 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                                            <ShoppingBag size={48} />
                                        </div>
                                    </div>
                                    <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>

                                    {/* Tag */}
                                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                                        POPULAR
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- STEP 2: CUSTOMIZE --- */}
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                        {/* Connector Node (Desktop) */}
                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-purple-100 rounded-full items-center justify-center shadow-sm z-20">
                            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        </div>

                        {/* Visual: Editor Mockup */}
                        <div className="lg:pr-20 order-1">
                            <div className="relative h-[400px] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                                {/* The UI Interface */}
                                <div className="absolute inset-4 bg-slate-800 rounded-2xl border border-slate-700 flex overflow-hidden">
                                    {/* Sidebar */}
                                    <div className="w-16 border-r border-slate-700 flex flex-col items-center py-4 gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50"><MousePointerClick size={16} /></div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 flex items-center justify-center"><Layers size={16} /></div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 flex items-center justify-center"><Palette size={16} /></div>
                                    </div>
                                    {/* Canvas Area */}
                                    <div className="flex-1 relative bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
                                        {/* UPDATED: Main design container 
                                            - Removed hover classes
                                            - Added inline style for looping scale animation
                                        */}
                                        <div
                                            className="w-48 h-56 bg-white rounded shadow-2xl flex items-center justify-center relative"
                                            style={{
                                                animation: 'gentleScaleLoop 3s ease-in-out infinite'
                                            }}
                                        >
                                            {/* Design on Shirt */}
                                            <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 absolute"></div>
                                            <div className="relative font-black text-2xl text-slate-900 tracking-tighter z-10">COOL<br />DESIGN</div>

                                            {/* UPDATED: Selection Box
                                                - Removed hover/opacity classes
                                                - Added inline style for looping fade animation synced with scale
                                            */}
                                            <div
                                                className="absolute inset-8 border-2 border-indigo-500 rounded border-dashed"
                                                style={{
                                                    animation: 'gentleFadeLoop 3s ease-in-out infinite'
                                                }}
                                            >
                                                <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500"></div>
                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500"></div>
                                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500"></div>
                                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Layers Panel */}
                                    <div className="w-40 bg-slate-800 border-l border-slate-700 p-3 hidden sm:block">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Layers</div>
                                        <div className="space-y-2">
                                            <div className="h-8 bg-slate-700 rounded border border-slate-600"></div>
                                            <div className="h-8 bg-indigo-500/20 rounded border border-indigo-500/50"></div>
                                            <div className="h-8 bg-slate-700 rounded border border-slate-600"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="lg:pl-20 order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-bold mb-6 border border-purple-100">
                                <Palette className="w-4 h-4" /> Step 02
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Make It Yours</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Upload your favorite photo, add text, or create a unique design using our studio tools. Whether it's for yourself or a gift, you're the artist.
                            </p>
                            <Link
                                href="/categories"
                                className="group inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 text-lg"
                            >
                                <span className="border-b-2 border-indigo-100 group-hover:border-indigo-600 transition-colors">Start Designing</span>
                                <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Add Keyframes for the new animations somewhere in your global CSS or a style tag */}
                    <style jsx global>{`
                        @keyframes gentleScaleLoop {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                        }
                        @keyframes gentleFadeLoop {
                            0%, 100% { opacity: 0; }
                            50% { opacity: 1; }
                        }
                    `}</style>

                    {/* --- STEP 3: SHIP --- */}
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Connector Node (Desktop) */}
                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-green-100 rounded-full items-center justify-center shadow-sm z-20">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        </div>

                        {/* Text Content */}
                        <div className="lg:text-right order-2 lg:order-1 lg:pr-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-bold mb-6 border border-green-100">
                                <Truck className="w-4 h-4" /> Step 03
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6">We Print & Ship</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Sit back and relax. We'll professionally print your custom design and ship it directly to you (or your lucky recipient) with care.
                            </p>
                            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20">
                                <Clock className="w-4 h-4 text-green-400" /> Fast Production
                            </div>
                        </div>

                        {/* Visual: Delivery/Tracking */}
                        <div className="lg:pl-20 order-1 lg:order-2">
                            <div className="relative h-[400px] w-full bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl group">
                                <div className="absolute inset-0 bg-green-50"></div>
                                {/* Map Background Pattern */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>

                                {/* Package Visual */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-48 h-48 bg-orange-100 rounded-3xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center shadow-2xl shadow-orange-500/20 border border-orange-200">
                                        <Package size={64} className="text-orange-600 opacity-80" />
                                        {/* Tape */}
                                        <div className="absolute top-0 bottom-0 left-1/2 w-8 bg-orange-600/10 border-x border-orange-600/20 -translate-x-1/2"></div>
                                    </div>
                                </div>

                                {/* Tracking Notification Overlay */}
                                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4 animate-bounce [animation-duration:3s]">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Update</div>
                                        <div className="text-sm font-bold text-slate-900">Out for Delivery</div>
                                    </div>
                                    <div className="ml-auto text-xs font-mono text-slate-400">NOW</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- CTA SECTION --- */}
            <div className="container-width px-4 mt-32">
                <div className="rounded-[3rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl group">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -top-1/2 -left-1/2 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                            Ready to create<br />your first product?
                        </h2>
                        <p className="text-indigo-200 text-lg mb-10">
                            Join thousands of creators turning their imagination into reality.
                        </p>
                        <Link
                            href="/categories"
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            Start Designing Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
