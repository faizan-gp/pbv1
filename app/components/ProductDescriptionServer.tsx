
import React from 'react';
import { Product } from '@/lib/firestore/products';

interface ProductDescriptionServerProps {
    product: Product;
}

export default function ProductDescriptionServer({ product }: ProductDescriptionServerProps) {
    const { shortDescription, bulletPoints, fullDescription: description, features } = product;
    return (
        <article className="space-y-16">
            {/* Description Section */}
            {(shortDescription || description) && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Product Overview</h2>
                    <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                        {shortDescription && <p className="font-medium text-slate-800 text-lg mb-6">{shortDescription}</p>}

                        {/* Bullet Points with Checkmarks */}
                        {bulletPoints && bulletPoints.length > 0 && (
                            <ul className="grid sm:grid-cols-2 gap-4 my-8 not-prose">
                                {bulletPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span className="leading-snug">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {description && (
                            <div className="bg-white rounded-2xl">
                                <p>{description}</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Features Section */}
            {features && features.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Key Features</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                {feature.image && (
                                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                        <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2 text-base">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FAQ Section (SEO Requirement) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Frequently Asked Questions</h2>
                <div className="grid gap-4">
                    {(product.faq || [
                        {
                            question: "How long does shipping take?",
                            answer: `Standard shipping for ${product.name} typically takes ${product.shippingTime || '2-5 business days'} within the USA. International shipping times vary.`
                        },
                        {
                            question: "Can I customize the design?",
                            answer: "Yes! Use our interactive design studio to add your own text, images, logo, or artwork to this product."
                        },
                        {
                            question: "What is the return policy?",
                            answer: "Since this is a custom printed product, we cannot accept returns for buyer's remorse. However, if there is a defect in printing or the item arrives damaged, we will offer a free replacement."
                        },
                        {
                            question: "How should I wash this item?",
                            answer: "To ensure longevity of the print, we recommend machine washing cold, inside-out, on a gentle cycle. Tumble dry low or hang-dry for best results."
                        }
                    ]).map((item, i) => (
                        <details key={i} className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-indigo-100 open:bg-indigo-50/30 transition-colors">
                            <summary className="flex items-center justify-between p-5 font-bold text-slate-900 cursor-pointer list-none select-none">
                                {item.question}
                                <span className="transition-transform group-open:rotate-180">
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </summary>
                            <div className="px-5 pb-5 pt-0 text-slate-600 leading-relaxed">
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </section>
        </article>
    );
}
