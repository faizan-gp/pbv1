"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Palette, Truck, ShieldCheck, MousePointerClick,
  Upload, ShoppingBag, Zap, CheckCircle2, Wand2, Layers,
  Image as ImageIcon, HelpCircle, ChevronDown, ChevronUp, Star,
  Sparkles, Users, Gift, PartyPopper, Briefcase, Mail, Leaf, Recycle
} from "lucide-react";
import ProductCard from "./components/ProductCard";
import TestimonialCard from "./components/TestimonialCard";
import ProcessCard from "./components/ProcessCard";
import { products } from "./data/products";

// --- MOCK DATA ---
const HERO_COLORS = [
  { name: "Midnight Black", class: "bg-slate-900", filter: "brightness(0.8)" },
  { name: "Royal Blue", class: "bg-blue-600", filter: "hue-rotate(200deg) brightness(1.2)" },
  { name: "Forest Green", class: "bg-green-700", filter: "hue-rotate(90deg) brightness(0.9)" },
  { name: "Heather Grey", class: "bg-gray-400", filter: "grayscale(100%) brightness(1.5)" },
];

const FAQS = [
  { question: "Is there a minimum order quantity?", answer: "No! You can order just one custom t-shirt or a thousand. We are built for individuals and bulk buyers alike." },
  { question: "How does the sizing work?", answer: "Our products run true to size. We include a detailed size chart on every product page with measurements in inches and cm." },
  { question: "Can I upload my own images?", answer: "Absolutely. Our design studio supports PNG, JPG, and SVG uploads. We also offer AI tools to help generate art if you're stuck." },
  { question: "How long does shipping take?", answer: "Production takes 1-2 business days. Shipping depends on your location, but typically takes 3-5 business days for domestic orders." },
];

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800", alt: "Custom Graphic Tee", user: "@alex_creates" },
  { src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80&w=800", alt: "Streetwear Hoodie", user: "@studio.noise" },
  { src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800", alt: "Minimalist Design", user: "@jess_designs" },
  { src: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800", alt: "Typography Shirt", user: "@type_matters" },
];

const steps = [
  {
    id: "01",
    title: "Pick a Product",
    description: "Choose from our premium catalog of t-shirts, hoodies, and eco-friendly accessories.",
    icon: <ShoppingBag className="w-6 h-6 text-white" />,
  },
  {
    id: "02",
    title: "Add Your Design",
    description: "Upload photos, use our AI generator, or combine text and shapes in the studio.",
    icon: <Palette className="w-6 h-6 text-white" />,
  },
  {
    id: "03",
    title: "We Print & Ship",
    description: "We handle the printing, quality checks, and shipping directly to your doorstep.",
    icon: <Truck className="w-6 h-6 text-white" />,
  },
];

export default function Home() {
  const [activeColor, setActiveColor] = useState(HERO_COLORS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 lg:pt-10 lg:pb-32 z-10 overflow-hidden">
        <div className="container-width grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Content */}
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

          {/* Right Interactive Visual */}
          <div className="lg:col-span-6 relative perspective-[2000px] flex flex-col items-center">

            {/* --- FLOATING ANIMATED STEPS --- */}

            {/* Step 1: Upload (Top Right) */}
            <div className="absolute top-12 -right-4 lg:-right-12 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-bounce [animation-duration:4s]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Upload size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 1</p>
                  <p className="text-xs font-bold text-slate-900">Add Text or Image</p>
                </div>
              </div>
            </div>

            {/* Step 2: Drag (Middle Left) */}
            {/* Removed 'hidden sm:block' so it shows on mobile now */}
            <div className="absolute top-1/2 -left-2 lg:-left-12 -translate-y-1/2 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-pulse [animation-duration:3s]">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <MousePointerClick size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 2</p>
                  <p className="text-xs font-bold text-slate-900">Drag & Drop</p>
                </div>
              </div>
            </div>

            {/* Step 3: Style (Bottom Right) */}
            <div className="absolute bottom-32 -right-4 lg:-right-8 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-bounce [animation-delay:1s] [animation-duration:4.5s]">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 3</p>
                  <p className="text-xs font-bold text-slate-900">Style It</p>
                </div>
              </div>
            </div>

            {/* --- MAIN CARD --- */}
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

              {/* The Product Image */}
              <div className="aspect-[4/5] bg-slate-50 rounded-lg mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: activeColor.class === 'bg-white' ? '#f8fafc' : '' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/products/shirt/colors/shirt_sand_dune.png"
                    alt="Custom Hoodie"
                    className="w-full h-full object-cover mix-blend-multiply transition-all duration-500"
                  // style={{ filter: activeColor.filter }}
                  />
                </div>
                {/* Design Zone Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-48 border-2 border-dashed border-indigo-500/50 rounded bg-indigo-500/5 flex flex-col items-center justify-center text-indigo-600 animate-pulse">
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
          </div>
        </div>
      </section>


      {/* --- VALUE PROPS --- */}
      <div className="border-y border-slate-100 bg-slate-50 py-12">
        <div className="container-width grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: ShoppingBag, title: "No Minimums", sub: "Buy 1 or 100" },
            { icon: Palette, title: "Free Editor", sub: "Design online instantly" },
            { icon: ShieldCheck, title: "High Quality", sub: "Premium printing" },
            { icon: Truck, title: "Global Shipping", sub: "Tracked delivery" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <item.icon className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- FEATURE DEEP DIVE (NEW) --- */}
      <section className="py-24 bg-white z-10 overflow-hidden">
        <div className="container-width mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* LEFT CONTENT */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Powerful tools, <br />
                <span className="text-indigo-600">Zero experience needed.</span>
              </h2>
              <p className="text-lg text-slate-600">
                Our design studio handles the technical stuff—print files, color matching, and layers—so you can focus on creativity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-purple-200">
                  <Wand2 className="w-8 h-8 text-purple-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">AI Generator</h4>
                  <p className="text-sm text-slate-500">Describe an image and our AI will create unique art for you.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-blue-200">
                  <Layers className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Smart Layers</h4>
                  <p className="text-sm text-slate-500">Easily combine text, shapes, and uploaded images.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-indigo-200">
                  <ImageIcon className="w-8 h-8 text-indigo-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">Instant Preview</h4>
                  <p className="text-sm text-slate-500">See exactly how your design looks on the fabric before buying.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-yellow-200">
                  <Zap className="w-8 h-8 text-yellow-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">One-Click Print</h4>
                  <p className="text-sm text-slate-500">Done designing? Add to cart and we handle production.</p>
                </div>
              </div>
            </div>

            {/* RIGHT VISUAL - DESIGN TOOL */}
            <div className="flex-1 relative w-full max-w-2xl lg:max-w-none">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl rotate-3 opacity-20 blur-xl scale-95"></div>

              {/* Main Container */}
              <div className="relative bg-slate-900 rounded-3xl p-2 shadow-2xl border border-slate-800 rotate-[-1deg] transition-transform hover:rotate-0 duration-500">

                {/* --- DESKTOP IMAGE (Hidden on Mobile) --- */}
                {/* Ensure your desktop image is roughly 16:9 or landscape */}
                <img
                  src="/design_editor.png"
                  alt="Desktop Editor Interface"
                  className="hidden md:block rounded-2xl w-full h-auto opacity-95 border border-slate-700/50"
                />

                {/* --- MOBILE IMAGE (Hidden on Desktop) --- */}
                {/* Ensure your mobile image is portrait or square */}
                <img
                  src="/design_editor_mobile.png"
                  alt="Mobile Editor Interface"
                  className="block md:hidden rounded-2xl w-full h-auto opacity-95 border border-slate-700/50"
                />

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- POPULAR PRODUCTS --- */}
      <section className="py-24 z-10 border-t border-slate-100 bg-slate-50">
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

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="relative py-24 bg-slate-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="container-width relative z-10 mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-4">
              How it Works
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
              You Design. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">We Do The Rest.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Turn your ideas into tangible products without managing inventory or shipping.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Connector Line (Desktop: Horizontal) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 rounded-full -z-10"></div>

            {/* Connector Line (Mobile: Vertical) */}
            <div className="md:hidden absolute top-12 bottom-12 left-1/2 w-1 -ml-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-200 rounded-full -z-10"></div>

            {steps.map((step, index) => (
              <div
                key={step.id}
                className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Large Watermark Number */}
                <div className="absolute -top-6 -right-4 text-9xl font-black text-slate-50 opacity-50 select-none group-hover:text-indigo-50 transition-colors duration-300">
                  {step.id}
                </div>

                {/* Icon Bubble */}
                <div className="relative w-16 h-16 mx-auto md:mx-0 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="relative text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
                </div>

                {/* Mobile visual connector (Dot) */}
                <div className="md:hidden absolute -bottom-16 left-1/2 -ml-2 w-4 h-4 rounded-full border-4 border-slate-50 bg-indigo-300"></div>
              </div>
            ))}
          </div>

          {/* Call to Action at bottom */}
          <div className="mt-16 text-center">
            <button className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-700 hover:shadow-lg hover:-translate-y-1">
              Start Creating Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* --- MATERIAL QUALITY (NEW) --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="container-width relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-3xl rotate-2 group-hover:rotate-1 transition-transform"></div>
              <div className="relative h-[400px] w-full bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
                {/* Placeholder for fabric closeup */}
                <img src="./" alt="Fabric Texture" className="w-full h-full object-cover opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-400" />
                    <span className="font-mono text-sm">Verified Heavyweight Cotton</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-indigo-400 font-bold mb-4">
                <Star className="fill-indigo-400 w-4 h-4" /> Premium Quality
              </div>
              <h2 className="text-4xl lg:text-5xl font-black mb-6">Not just a print.<br />An investment.</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                We hate cheap, scratchy shirts as much as you do. That's why we only use combed ring-spun cotton and retail-ready blends.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1"><CheckCircle2 className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <strong className="block text-white">Direct-to-Garment (DTG) Tech</strong>
                    <span className="text-slate-400 text-sm">Ink is injected into the fabric, not sitting on top. No cracking.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1"><CheckCircle2 className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <strong className="block text-white">Eco-Friendly Inks</strong>
                    <span className="text-slate-400 text-sm">Water-based, non-toxic inks that are safe for everyone.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUSTAINABILITY PROMISE --- */}
      <section className="py-24 bg-green-50/50 border-t border-slate-100">
        <div className="container-width">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-green-700 font-bold mb-6 bg-green-100 px-4 py-2 rounded-full text-sm">
                <Leaf className="w-4 h-4" /> Eco-Conscious Production
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Fashion that doesn't<br />hurt the planet.</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Traditional fashion creates waste. We only print what you order. Zero inventory, zero waste, and 100% biodegradable packaging.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                  <Recycle className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-2xl font-black text-slate-900">0%</div>
                  <div className="text-sm text-slate-500 font-medium">Inventory Waste</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                  <Truck className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-2xl font-black text-slate-900">Local</div>
                  <div className="text-sm text-slate-500 font-medium">Fulfillment Centers</div>
                </div>
              </div>
            </div>

            {/* Abstract Eco Visual */}
            <div className="flex-1 relative h-[400px] w-full bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-multiply"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

              <div className="relative z-10 text-center">
                <span className="text-9xl">🌿</span>
                <p className="mt-4 font-bold text-slate-900">100% Plastic-Free Packaging</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INSPIRATION GALLERY (NEW) --- */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Made by our Community</h2>
            <p className="text-slate-600">See what others are creating right now.</p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer">
                <img src={img.src} alt={img.alt} className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-sm">{img.alt}</p>
                    <p className="text-xs opacity-80">{img.user}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Promo Card in Grid */}
            <div className="break-inside-avoid relative bg-indigo-600 rounded-2xl p-8 text-center text-white flex flex-col items-center justify-center h-[200px]">
              <h3 className="font-bold text-2xl mb-2">Your Turn?</h3>
              <Link href="/products" className="underline underline-offset-4 hover:text-indigo-200">Start Designing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ ACCORDION (NEW) --- */}
      <section className="py-24 bg-slate-50">
        <div className="container-width max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  {openFaq === i ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER SECTION --- */}
      <section className="py-24 bg-white">
        <div className="container-width">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-30 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-indigo-300 font-bold mb-4">
                  <Mail className="w-5 h-5" /> The Design Club
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Get 15% off your first order</h2>
                <p className="text-slate-400 text-lg">Join 50,000+ creators getting weekly design tips, free assets, and exclusive discounts.</p>
              </div>

              <div className="w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                  />
                  <button className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-indigo-50 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-4 text-center sm:text-left">No spam. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="px-4 pb-12 z-10 pt-12 bg-slate-50">
        <div className="container-width">
          <div className="rounded-[3rem] relative overflow-hidden bg-slate-900 px-6 py-24 text-center shadow-2xl md:px-12 lg:py-32 group">
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