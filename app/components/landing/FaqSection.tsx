"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

export default function FaqSection({ items }: { items: FAQItem[] }) {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <section className="py-24 bg-slate-50">
            <div className="container-width max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {items.map((faq, i) => (
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
    );
}
