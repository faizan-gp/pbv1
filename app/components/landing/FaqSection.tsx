"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
    { question: "Is there a minimum order quantity?", answer: "No! You can order just one custom t-shirt or a thousand. We are built for individuals and bulk buyers alike." },
    { question: "How does the sizing work?", answer: "Our products run true to size. We include a detailed size chart on every product page with measurements in inches and cm." },
    { question: "Can I upload my own images?", answer: "Absolutely. Our design studio supports PNG, JPG, and SVG uploads. We also offer AI tools to help generate art if you're stuck." },
    { question: "How long does shipping take?", answer: "Production takes 1-2 business days. Shipping depends on your location, but typically takes 3-5 business days for domestic orders." },
];

export default function FaqSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
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
    );
}
