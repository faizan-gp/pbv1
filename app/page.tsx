"use client"; // Needed for the interactive color picker in Hero

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Palette, Truck, ShieldCheck, MousePointerClick, Upload, ShoppingBag, Zap, CheckCircle2 } from "lucide-react";
import ProductCard from "./components/ProductCard";
import TestimonialCard from "./components/TestimonialCard";
import { products } from "./data/products";
import ProcessCard from "./components/ProcessCard";

// Mock data for the hero interaction
const HERO_COLORS = [
  { name: "Midnight Black", class: "bg-slate-900", filter: "brightness(0.8)" },
  { name: "Royal Blue", class: "bg-blue-600", filter: "hue-rotate(200deg) brightness(1.2)" },
  { name: "Forest Green", class: "bg-green-700", filter: "hue-rotate(90deg) brightness(0.9)" },
  { name: "Heather Grey", class: "bg-gray-400", filter: "grayscale(100%) brightness(1.5)" },
];

export default function Home() {
  const [activeColor, setActiveColor] = useState(HERO_COLORS[0]);

  // Mock featured products (Blanks)
  const featuredProducts = products
    .filter(p => p.trending)
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: 29.99,
      image: p.image
    }));

  return (
    <div className="flex flex-col gap-0 bg-white min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* HERO SECTION: The "Mini Customizer" */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 z-10 overflow-hidden">
        <div className="container-width grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT: The Pitch */}
          <div className="lg:col-span-6 text-center lg:text-left z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>No Minimums &bull; Buy 1 or 1,000</span>
            </div>

            <h1 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
              Create Custom <br />
              Apparel in <span className="text-indigo-600">Minutes.</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-10 text-balance font-medium">
              The easiest way to design your own clothes. Pick a product, upload your photo or logo, and we'll print and ship it to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 px-8 font-bold text-white shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all"
              >
                Start Designing Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                See Products
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500 font-medium">
              Trusted by 10,000+ happy customers
            </p>
          </div>

          {/* RIGHT: The "Interactive Mockup" */}
          <div className="lg:col-span-6 relative perspective-[2000px] flex flex-col items-center">

            {/* The Product Viewer */}
            <div className="relative z-20 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 transform transition-transform duration-500 hover:rotate-y-[-2deg]">

              {/* Visual Header */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-mono text-slate-400">PREVIEW MODE</div>
              </div>

              {/* The Dynamic Image */}
              <div className="aspect-[4/5] bg-slate-50 rounded-lg mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: activeColor.class === 'bg-white' ? '#f8fafc' : '' }}></div>

                {/* Placeholder for Product Image - We use CSS filters to simulate color change for demo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* In a real app, you'd swap the image src based on color. Here we simulate it. */}
                  <img
                    src="/hoodie.jpg"
                    alt="Custom Hoodie"
                    className="w-full h-full object-cover mix-blend-multiply transition-all duration-500"
                    // Note: In real production, use separate images per color, not CSS filters
                    style={{ filter: activeColor.filter }}
                  />
                </div>

                {/* The "Design Zone" Overlay - Shows user where design goes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-indigo-500/50 rounded bg-indigo-500/5 flex flex-col items-center justify-center text-indigo-600 animate-pulse">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Design Here</span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Select Color</span>
                  <span className="text-xs text-slate-500">{activeColor.name}</span>
                </div>
                <div className="flex gap-3">
                  {HERO_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setActiveColor(color)}
                      className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all ${color.class} ${activeColor.name === color.name ? 'border-indigo-600 scale-110 ring-2 ring-indigo-200' : 'border-slate-200 hover:scale-105'}`}
                      aria-label={`Select ${color.name}`}
                    />
                  ))}
                </div>
                <button className="w-full py-3 mt-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <Palette className="w-4 h-4" /> Customize This Product
                </button>
              </div>
            </div>

            {/* Floating UI Elements indicating "Ease of Use" */}
            <div className="absolute top-1/2 -right-4 lg:-right-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-30 animate-bounce [animation-duration:4s]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><MousePointerClick size={20} /></div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Step 1</p>
                  <p className="text-sm font-bold text-slate-900">Drag & Drop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS STRIP */}
      <div className="border-y border-slate-100 bg-slate-50 py-12">
        <div className="container-width grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <ShoppingBag className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900">No Minimums</h3>
            <p className="text-sm text-slate-500">Buy 1 or 100</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Palette className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900">Free Editor</h3>
            <p className="text-sm text-slate-500">Design online instantly</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900">High Quality</h3>
            <p className="text-sm text-slate-500">Premium printing</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Truck className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900">Global Shipping</h3>
            <p className="text-sm text-slate-500">Tracked delivery</p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS (The Process) */}
      <section id="how-it-works" className="relative py-32 z-10 bg-white">
        <div className="container-width">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold mb-4">Simple Process</div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">You Design. We Do The Rest.</h2>
            <p className="text-lg text-slate-600">Turn your ideas into tangible products in 3 easy steps.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[28%] left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-slate-200 -z-10"></div>

            <ProcessCard
              number="01"
              title="Pick a Product"
              description="Choose from our catalog of t-shirts, hoodies, and accessories."
              icon={<ShoppingBag className="h-6 w-6 text-white" />}

            />
            <ProcessCard
              number="02"
              title="Add Your Design"
              description="Upload photos, add text, or use our icons in the Design Studio."
              icon={<Palette className="h-6 w-6 text-white" />}

            />
            <ProcessCard
              number="03"
              title="We Print & Ship"
              description="We print your custom piece and mail it directly to you."
              icon={<Truck className="h-6 w-6 text-white" />}

              isLast
            />
          </div>
        </div>
      </section>

      {/* POPULAR CANVASES (Products) */}
      <section className="py-32 z-10 border-t border-slate-100 bg-slate-50">
        <div className="container-width">
          <div className="mb-12 flex flex-col sm:flex-row items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Popular Canvases</h2>
              <p className="mt-2 text-slate-600">Our best-selling blanks, ready for your customization.</p>
            </div>
            <Link href="/products" className="group flex items-center text-sm font-bold text-indigo-600">
              View All Blanks <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 pb-12 z-10">
        <div className="container-width">
          <div className="rounded-[3rem] relative overflow-hidden bg-slate-900 px-6 py-24 text-center shadow-2xl md:px-12 lg:py-32 group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-8">
                Make it yours today.
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-xl font-medium text-slate-300 leading-relaxed">
                Why wear what everyone else is wearing? <br />Create something unique with our easy-to-use design tool.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="h-16 px-10 rounded-full bg-indigo-600 text-white text-lg font-bold flex items-center hover:bg-indigo-500 hover:scale-105 transition-all duration-300"
                >
                  Start Designing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}