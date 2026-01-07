
import Link from "next/link";
import {
  ArrowRight, Truck, ShieldCheck,
  ShoppingBag, Zap, Wand2, Layers,
  Image as ImageIcon, Leaf, Recycle, CheckCircle2, Star, Mail,
  Shirt, Scissors, Baby, Home as HomeIcon
} from "lucide-react";
import ProductCard from "./components/ProductCard";
import HeroSection from "./components/landing/HeroSection";
import FaqSection from "./components/landing/FaqSection";

import { getAllProducts } from "@/lib/firestore/products";
import { getCategories, CATEGORIES } from "@/lib/categories";

// --- STATIC DATA ---
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
    icon: <PaletteIcon className="w-6 h-6 text-white" />,
  },
  {
    id: "03",
    title: "We Print & Ship",
    description: "We handle the printing, quality checks, and shipping directly to your doorstep.",
  },
];

const FAQS = [
  { question: "Is there a minimum order quantity?", answer: "No! You can order just one custom t-shirt or a thousand. We are built for individuals and bulk buyers alike." },
  { question: "How does the sizing work?", answer: "Our products run true to size. We include a detailed size chart on every product page with measurements in inches and cm." },
  { question: "Can I upload my own images?", answer: "Absolutely. Our design studio supports PNG, JPG, and SVG uploads. We also offer AI tools to help generate art if you're stuck." },
  { question: "How long does shipping take?", answer: "Production takes 1-2 business days. Shipping depends on your location, but typically takes 3-5 business days for domestic orders." },
];

// Re-export PaletteIcon locally if needed, or import from lucide-react. 
// Note: In original file Palette was imported. I should import it too.
import { Palette as PaletteIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Your Own Custom Apparel | Print Brawl",
  description: "Create unique custom t-shirts, hoodies, and gifts. Upload your photos or use our design tools to make something special.",
  alternates: {
    canonical: "https://www.printbrawl.com",
  },
};

async function getTrendingProducts() {
  try {
    const allProducts = await getAllProducts();
    // Filter for trending and take top 6 (grid fits 3, so 3 or 6 is good)
    return allProducts.filter(p => p.trending === true).slice(0, 6);
  } catch (error) {
    console.error("Failed to fetch trending products", error);
    return [];
  }
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function Home() {
  const featuredProducts = await getTrendingProducts();
  const allCategories = await getCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="flex flex-col gap-0 bg-white min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <HeroSection />


      <script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- VALUE PROPS --- */}
      <div className="border-y border-slate-100 bg-slate-50 py-12">
        <div className="container-width grid grid-cols-2 md:grid-cols-4 gap-8">
          <h2 className="sr-only">Why Choose Print Brawl</h2>
          {[
            { icon: ShoppingBag, title: "No Minimums", sub: "Buy 1 or 100" },
            { icon: PaletteIcon, title: "Free Editor", sub: "Design online instantly" },
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

      {/* --- FEATURE DEEP DIVE --- */}
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
                  <h3 className="font-bold text-slate-900 mb-1">AI Generator</h3>
                  <p className="text-sm text-slate-500">Describe an image and our AI will create unique art for you.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-blue-200">
                  <Layers className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-slate-900 mb-1">Smart Layers</h3>
                  <p className="text-sm text-slate-500">Easily combine text, shapes, and uploaded images.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-indigo-200">
                  <ImageIcon className="w-8 h-8 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-slate-900 mb-1">Instant Preview</h3>
                  <p className="text-sm text-slate-500">See exactly how your design looks on the fabric before buying.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-yellow-200">
                  <Zap className="w-8 h-8 text-yellow-600 mb-3" />
                  <h3 className="font-bold text-slate-900 mb-1">One-Click Print</h3>
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
                <img
                  src="/design_editor.png"
                  alt="Desktop Editor Interface"
                  className="hidden md:block rounded-2xl w-full h-auto opacity-95 border border-slate-700/50"
                />

                {/* --- MOBILE IMAGE (Hidden on Desktop) --- */}
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

      {/* --- CATEGORIES SECTION (NEW) --- */}
      <section className="py-24 bg-white">
        <div className="container-width px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Premium blanks designed for your brand. Explore our curated collections.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 font-bold text-slate-900 hover:text-indigo-600 transition-colors"
            >
              View Full Catalog <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(allCategories).map((cat, index) => {
              // Icon Mapping
              const iconMap: Record<string, any> = {
                'mens-clothing': Shirt,
                'womens-clothing': Scissors,
                'kids-clothing': Baby,
                'accessories': ShoppingBag,
                'home-living': HomeIcon
              };
              const Icon = iconMap[cat.slug] || Star;

              // Staggered color accents for visual variety
              const colors = [
                'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
                'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
                'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
                'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
              ];
              const colorClass = colors[index % colors.length];

              return (
                <Link
                  href={`/products/${cat.slug}`}
                  key={cat.slug}
                  className="group relative flex flex-col justify-between min-h-[320px] p-8 rounded-[2rem] border border-slate-100 bg-slate-50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:bg-white"
                >
                  {/* Background Decor - Subtle Gradient Blob */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl group-hover:bg-indigo-50/50 transition-colors" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-sm ${colorClass}`}>
                      <Icon className="w-10 h-10" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-[80%]">
                      {cat.description || `Premium quality ${cat.name.toLowerCase()} for your custom designs.`}
                    </p>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="relative z-10 flex items-center gap-3 mt-8 font-bold text-slate-900 opacity-60 group-hover:opacity-100 group-hover:text-indigo-600 transition-all">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Mobile Link Footer */}
          <div className="mt-8 md:hidden">
            <Link href="/products" className="w-full py-4 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-900 hover:bg-slate-50">
              View Full Catalog
            </Link>
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
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
                No trending products found. Check back soon!
              </div>
            )}
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

      {/* --- MATERIAL QUALITY --- */}
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


      {/* --- FAQ ACCORDION --- */}
      <FaqSection items={FAQS} />

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