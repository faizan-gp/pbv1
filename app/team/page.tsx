
import { Metadata } from 'next';
import Image from 'next/image';
import { Linkedin, Printer, Truck, Palette, Terminal, Zap } from 'lucide-react';

export const metadata: Metadata = {
    title: "Meet the Team | Print Brawl",
    description: "Meet Faizan, the designer and developer behind Print Brawl, and learn about our partnership with Printify.",
};

export default function TeamPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-24">
            <div className="container-width max-w-5xl px-6">

                {/* HEADLINE */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Meet the <span className="text-indigo-600">Team.</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Print Brawl is a one-person studio driven by a passion for design, code, and creating unique physical products.
                    </p>
                </div>

                {/* FAIZAN'S PROFILE */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12 md:gap-20 relative overflow-hidden group">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

                    {/* Left: Content */}
                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-6">
                            <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            Founder & Creator
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Hey, I'm Faizan.
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            I created Print Brawl to combine my love for software development with the tangible joy of custom apparel. As a solo founder, I wear every hat—from writing the React code that powers this site to designing the graphics and handling operations.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
                            <Badge icon={Palette} label="Designer" />
                            <Badge icon={Terminal} label="Developer" />
                            <Badge icon={Zap} label="Operations" />
                        </div>

                        <a
                            href="https://www.linkedin.com/in/fyizan/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 hover:underline text-lg"
                        >
                            <Linkedin className="w-5 h-5" />
                            Connect on LinkedIn
                        </a>
                    </div>

                    {/* Right: Visual/Image Placeholder */}
                    <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                        {/* Using a Memoji-style placeholder or just a nice graphic since I don't have a photo URL yet. 
                             If user provided one I'd use it, otherwise a Initials placeholder is safe. */}
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl ring-8 ring-white">
                            <span className="text-7xl md:text-8xl font-black text-white/90">F.</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 rotate-12">
                            <span className="text-3xl">🚀</span>
                        </div>
                    </div>
                </div>

                {/* THE PARTNERSHIP SECTION */}
                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-slate-900">How It Works</h3>
                        <p className="text-slate-500 mt-2">I handle the magic. Partners handle the muscle.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Card 1: My Role */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                                <Palette className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Creative & Tech</h4>
                            <p className="text-slate-600">
                                I maintain the website, develop the 3D configurator, and curate the design assets. Every interaction on the site is built by hand to ensure a smooth experience.
                            </p>
                        </div>

                        {/* Card 2: Printify Role */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-bl-xl">
                                Verified Partner
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                                <Printer className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Fulfillment by Printify</h4>
                            <p className="text-slate-600">
                                I've partnered with <strong>Printify</strong>, a global leader in print-on-demand. Once you place an order, it's routed to their premium print network for high-quality production and worldwide shipping.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Badge({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}
