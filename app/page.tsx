import Link from "next/link";
import { ArrowRight, Palette, Truck, ShieldCheck, PenTool, ShoppingBag, Stars } from "lucide-react";
import ProductCard from "./components/ProductCard";
import TestimonialCard from "./components/TestimonialCard";
import ProcessCard from "./components/ProcessCard";
import { products } from "./data/products";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrintBrawl | Custom Apparel Design Studio",
  description: "Create unique custom t-shirts, hoodies, and accessories with PrintBrawl. Premium quality printing, no minimums, and fast global shipping.",
};

export default function Home() {
  const featuredProducts = products.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    price: 29.99, // Fallback/Mock
    image: p.image
  }));

  return (
    <div className="flex flex-col gap-0 bg-white min-h-screen selection:bg-indigo-500/30">

      {/* Background Grid - Global Fixed or Repeated */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 z-10">
        <div className="container-width grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left z-10 order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 shadow-sm">
              <Stars className="mr-2 h-4 w-4" /> New: AI-Powered Designs Available
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-tight text-gray-900 mb-6">
              Wear Your <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                Imagination
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10">
              The ultimate design studio for custom apparel. Create unique pieces that tell your story with our premium quality printing and intuitive tools.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex h-14 items-center justify-center rounded-full bg-gray-900 text-white px-8 text-lg font-bold shadow-lg shadow-gray-900/20 transition-all hover:scale-105 hover:shadow-gray-900/30"
              >
                Start Creating <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border border-gray-200 bg-white px-8 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                See How it Works
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-90 transition-all">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 w-12 border-2 border-white rounded-full bg-gray-200" />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900 text-base">10,000+ Creators</p>
                <p className="text-gray-500">Trust PrintBrawl</p>
              </div>
            </div>
          </div>

          {/* Right Visuals */}
          <div className="relative z-10 block h-[500px] lg:h-[700px] w-full mt-12 lg:mt-0 perspective-[2000px] order-1 lg:order-2">
            {/* Floating Card 1 */}
            <div className="absolute top-0 right-10 lg:right-10 w-72 lg:w-[400px] transform rotate-y-[-10deg] rotate-6 transition-transform hover:rotate-0 duration-700 z-20">
              <ProductCard product={{ id: "hero-1", name: "Artist Edition Hoodie", price: 59.99, image: "/hoodie.jpg" }} />
            </div>
            {/* Floating Card 2 */}
            <div className="absolute top-40 lg:top-60 right-20 lg:right-60 w-64 lg:w-80 transform rotate-y-[10deg] -rotate-3 transition-transform hover:rotate-0 duration-700 z-10 opacity-90 blur-[1px] hover:blur-0">
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded mb-3"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Bento Style) */}
      <section className="py-32 relative z-10 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
        <div className="container-width relative z-10">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">Built for Creators.<br />Designed for Speed.</h2>
            <p className="text-xl text-gray-600">Everything you need to create your brand, packed into one powerful platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
            {/* Card 1: Customization */}
            <div className="group relative md:col-span-2 rounded-[2.5rem] border border-gray-200 bg-white overflow-hidden hover:border-indigo-200 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-10 relative h-full flex flex-col justify-between z-10">
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4 border border-indigo-100">
                    <Palette className="w-4 h-4" /> <span>Studio Grade Tools</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Unlimited Customization</h3>
                  <p className="text-gray-500 text-lg">Total control over every pixel. 3D previews, smart guides, and vector support.</p>
                </div>

                <div className="absolute bottom-0 right-0 w-[60%] h-[70%] bg-gray-50 border-t border-l border-gray-200 rounded-tl-3xl p-6 shadow-xl translate-y-4 translate-x-4 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform duration-500">
                  <div className="flex gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-100 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-full bg-green-500 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-700 cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-gray-200 rounded-full"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Shipping */}
            <div className="group relative md:row-span-2 rounded-[2.5rem] border border-gray-200 bg-white overflow-hidden hover:border-green-200 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-green-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-10 relative h-full flex flex-col z-10">
                <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4 border border-green-100">
                  <Truck className="w-4 h-4" /> <span>Global Network</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Fast Global Shipping</h3>
                <p className="text-gray-500 mb-8 text-lg">Delivery to 180+ countries with real-time tracking.</p>

                <div className="flex-1 relative w-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-green-500 rounded-full z-10 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-ping"></div>
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-green-500 rounded-full z-10"></div>

                  <div className="absolute top-2/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-full z-10 border border-white"></div>
                  <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-full z-10 border border-white"></div>

                  <div className="absolute top-[28%] left-[60%] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200 text-xs text-green-600 font-mono shadow-lg">
                    In Transit
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Quality */}
            <div className="group relative md:col-span-2 rounded-[2.5rem] border border-gray-200 bg-white overflow-hidden hover:border-purple-200 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-10 relative h-full flex flex-row items-center justify-between gap-8 z-10">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mb-4 border border-purple-100">
                    <ShieldCheck className="w-4 h-4" /> <span>Quality First</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Premium Materials</h3>
                  <p className="text-gray-500 text-lg">Organic cotton, sustainable inks, and prints that never fade.</p>
                </div>
                <div className="hidden sm:flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-tr from-purple-100 to-blue-100 border border-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-20 h-20 text-purple-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 z-10 border-t border-gray-200">
        <div className="container-width">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">From idea to doorstep in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
            <ProcessCard number="01" title="Pick Product" description="Select the perfect canvas for your art." icon={<ShoppingBag className="h-8 w-8" />} />
            <ProcessCard number="02" title="Customize" description="Upload images, add text, and adjust colors." icon={<PenTool className="h-8 w-8" />} />
            <ProcessCard number="03" title="We Deliver" description="We print, pack, and ship directly to you." icon={<Truck className="h-8 w-8" />} isLast />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 z-10 border-t border-gray-200 bg-gray-50">
        <div className="container-width">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Trending Now</h2>
              <p className="mt-4 text-gray-600">Most popular bases for this week's top creators.</p>
            </div>
            <Link href="/products" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:inline-flex items-center">
              View collection <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="container-width py-32 z-10 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-square w-full rounded-[2.5rem] bg-gray-50 p-8 flex items-center justify-center border border-gray-200 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0,transparent_70%)]"></div>
              <ShieldCheck className="w-32 h-32 text-gray-300 group-hover:text-gray-400 transition-colors" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 font-mono text-xs tracking-[0.2em] uppercase">High-Res Detail</div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">Quality You Can Feel</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>We source only the finest combed ring-spun cotton and eco-friendly blends.</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                  <span><strong className="text-gray-900">Double-stitched seams</strong> for lifelong durability.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                  <span><strong className="text-gray-900">Eco-friendly inks</strong> vibrant yet soft to the touch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-width py-32 z-10 border-t border-gray-200 bg-gray-50/50">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">What Creators Say</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TestimonialCard name="Sarah Jenkins" role="Digital Artist" quote="PrintBrawl simplified my merch line completely. The quality is unmatched." avatar="SJ" />
          <TestimonialCard name="Mike Chen" role="Founder" quote="We ordered custom hoodies for our retreat. Seamless process and fast delivery." avatar="MC" />
          <TestimonialCard name="Jessica Lee" role="Blogger" quote="The customization tool is actually fun to use. I see exactly what I'm getting." avatar="JL" />
        </div>
      </section>

      {/* Newsletter - Redesigned */}
      <section className="py-24 border-t border-gray-200 relative z-10 bg-white">
        <div className="container-width max-w-4xl">
          <div className="rounded-[2.5rem] bg-gray-50 border border-gray-200 p-12 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay in the Loop</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Get the latest design trends, exclusive discounts, and product drops.</p>

            <div className="flex max-w-md mx-auto relative group">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-gray-900 text-white px-6 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="container-width pb-24 z-10">
        <div className="rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8 drop-shadow-lg">
              Ready to start your journey?
            </h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Join thousands of creators turning their ideas into reality today. <br />No minimums, no setup fees. Just pure creativity.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-center"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
