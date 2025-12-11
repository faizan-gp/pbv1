import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import { ArrowLeft, Check, Ruler, Info, Truck, Shield } from 'lucide-react';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findOne({ id }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product)) as IProduct;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    // Default Images
    const mainImage = product.image;
    const galleryImages = [mainImage, ...(product.listingImages || [])];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
            {/* Navigation */}
            <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/products" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Products
                    </Link>
                    <Link href="/" className="text-xl font-bold tracking-tighter">
                        PRINT<span className="text-indigo-600">BRAWL</span>
                    </Link>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* LEFT: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
                            <img
                                src={mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {galleryImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {galleryImages.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:ring-2 hover:ring-indigo-600 transition-all">
                                        <img src={img} alt={`View ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            {product.trending && (
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                                    Best Seller
                                </span>
                            )}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2">{product.name}</h1>
                            <p className="text-lg text-gray-500">{product.category}</p>
                        </div>

                        {/* Price (Mocked for now as it's not in schema) */}
                        <div className="text-2xl font-medium text-gray-900 mb-8 border-b border-gray-100 pb-8">
                            $29.00 <span className="text-sm text-gray-400 font-normal ml-2">Base Price</span>
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <div className="prose prose-sm text-gray-600 mb-8">
                                <p>{product.shortDescription}</p>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex gap-4 mb-12">
                            <Link
                                href={`/customize/${product.id}`}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1"
                            >
                                Start Designing
                            </Link>
                        </div>

                        {/* Details Tabs / Accordion */}
                        <div className="space-y-8">

                            {/* full description */}
                            {product.fullDescription && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Info size={16} /> About this product
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {product.fullDescription}
                                    </p>
                                </div>
                            )}

                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Check size={16} /> Key Features
                                    </h3>
                                    <ul className="grid grid-cols-1 gap-3">
                                        {product.features.map((feature: any, i: number) => (
                                            <li key={i} className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="p-1.5 bg-white rounded-md text-indigo-600 shadow-sm">
                                                    {/* We could dynamically map icons here based on feature.icon string */}
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <strong className="block text-gray-900 text-sm">{feature.title}</strong>
                                                    <span className="text-xs text-gray-500">{feature.description}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Care Instructions */}
                            {product.careInstructions && product.careInstructions.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Shield size={16} /> Care Instructions
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-1">
                                        {product.careInstructions.map((inst: string, i: number) => (
                                            <li key={i}>{inst}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Size Guide Preview */}
                            {product.sizeGuide && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Ruler size={16} /> Size Guide
                                    </h3>
                                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Size</th>
                                                    <th className="px-4 py-3 font-medium">Width (in)</th>
                                                    <th className="px-4 py-3 font-medium">Length (in)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(product.sizeGuide.imperial || []).slice(0, 3).map((row: any, i: number) => (
                                                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{row.size}</td>
                                                        <td className="px-4 py-2 text-gray-500">{row.width}"</td>
                                                        <td className="px-4 py-2 text-gray-500">{row.length}"</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-gray-50 px-4 py-2 text-center">
                                            <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View Full Size Chart</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
