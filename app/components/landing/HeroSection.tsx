import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Truck } from "lucide-react";
import HeroVisual from "./HeroVisual";

export default function HeroSection() {
    return (
        <section className="relative pt-20 pb-16 lg:pt-10 lg:pb-32 z-10 overflow-hidden">
            <div className="container-width grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left Content */}
                <div className="lg:col-span-6 text-center lg:text-left z-10">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700 shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>No Minimums &bull; Buy 1 or 1,000</span>
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
                        Create Custom <br />
                        Products in <span className="text-indigo-600">Minutes.</span>
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed mb-6 text-balance font-medium">
                        The easiest way to design your own custom products. Pick an item, upload your photo or logo, and we'll print and ship it to your door.
                    </p>

                    {/* Price visibility */}
                    <p className="text-lg font-bold text-slate-900 mb-8">
                        Starting at <span className="text-indigo-600">$24.99</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link
                            href="/categories"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 px-8 font-bold text-white shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all"
                        >
                            Start Designing Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            See Products
                        </Link>
                    </div>

                    {/* Trust signals */}
                    <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="font-semibold text-slate-700">4.9/5</span>
                            <span>from 2,000+ reviews</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span>Secure Checkout</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span>Fast Shipping</span>
                        </div>
                    </div>
                </div>

                {/* Right Interactive Visual */}
                <div className="lg:col-span-6">
                    <HeroVisual />
                </div>
            </div>
        </section>
    );
}
