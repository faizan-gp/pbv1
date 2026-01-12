
import React from 'react';
import { ShieldCheck, Truck, Zap, Heart } from 'lucide-react';

interface CategorySEOContentProps {
    categoryName: string;
    description: string;
}

export default function CategorySEOContent({ categoryName, description }: CategorySEOContentProps) {
    if (!description) return null;

    return (
        <section className="bg-slate-50 border-t border-slate-200 py-16 lg:py-24 mt-12">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                {/* Long Description Content */}
                <div className="prose prose-lg prose-slate mx-auto max-w-none mb-16">
                    <div className="prose prose-lg prose-slate mx-auto max-w-none mb-16">
                        {(() => {
                            const lines = description.split('\n');
                            const elements = [];
                            let listBuffer: React.ReactNode[] = [];

                            lines.forEach((line, i) => {
                                const trimmed = line.trim();
                                if (trimmed.startsWith('* ')) {
                                    const parts = line.replace(/^\* /, '').split('**');
                                    listBuffer.push(
                                        <li key={`li-${i}`} className="ml-4 list-disc mb-2 marker:text-indigo-500 text-slate-600 pl-2">
                                            {parts.map((part, idx) => (
                                                idx % 2 === 1 ? <strong key={idx} className="font-bold text-slate-900">{part}</strong> : part
                                            ))}
                                        </li>
                                    );
                                } else {
                                    if (listBuffer.length > 0) {
                                        elements.push(<ul key={`ul-${i}`} className="my-4 space-y-2">{listBuffer}</ul>);
                                        listBuffer = [];
                                    }

                                    if (trimmed.startsWith('### ')) {
                                        elements.push(<h3 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{trimmed.replace('### ', '')}</h3>);
                                    } else if (trimmed.startsWith('## ')) {
                                        elements.push(<h2 key={i} className="text-3xl font-black text-slate-900 mt-12 mb-6">{trimmed.replace('## ', '')}</h2>);
                                    } else if (trimmed.length > 0) {
                                        const parts = line.split('**');
                                        if (parts.length > 1) {
                                            elements.push(
                                                <p key={i} className="mb-4 text-slate-600 leading-relaxed">
                                                    {parts.map((part, idx) => (
                                                        idx % 2 === 1 ? <strong key={idx} className="font-bold text-slate-900">{part}</strong> : part
                                                    ))}
                                                </p>
                                            );
                                        } else {
                                            elements.push(<p key={i} className="mb-4 text-slate-600 leading-relaxed">{trimmed}</p>);
                                        }
                                    }
                                }
                            });

                            if (listBuffer.length > 0) {
                                elements.push(<ul key="ul-end" className="my-4 space-y-2">{listBuffer}</ul>);
                            }

                            return elements;
                        })()}
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <h2 className="text-3xl font-black text-center text-slate-900 mb-12">
                        Why Choose Print Brawl for {categoryName}?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Zap className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Premium Quality</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    We use industry-leading DTG printing tech and high-quality garments to ensure your custom {categoryName.toLowerCase()} look and feel retail-ready.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Truck className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Fast Production</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Most orders ship within 2-3 business days. We print locally to get your gear to you faster.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Satisfaction Guarantee</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    If there's an issue with the print or product quality, we'll replace it for free. Your satisfaction is our priority.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Heart className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">No Minimums</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Whether you need 1 item or 1,000, we've got you covered. No setup fees, no minimum order quantities.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
