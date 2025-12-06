import React from 'react';

export default function FAQPage() {
    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Since every product is custom-made to order, production typically takes 2-7 business days. Once shipped, standard domestic delivery takes 2-5 business days, while international shipping can take 10-30 business days depending on the destination."
        },
        {
            question: "What is your return policy?",
            answer: "Each item is uniquely printed just for you. As such, we cannot accept returns for buyer's remorse (e.g., wrong size or color). However, if your product arrives damaged or with a manufacturing defect, please contact us within 30 days for a free replacement or refund."
        },
        {
            question: "Can I cancel or change my order?",
            answer: "We send orders to production almost immediately to ensure fast delivery. You have a very short window (usually 1 hour) to request changes. Once production begins, we cannot cancel or modify the order."
        },
        {
            question: "How do I care for my custom printed apparel?",
            answer: "For Direct-to-Garment (DTG) prints, machine wash cold, inside-out, on a gentle cycle with mild detergent and like colors. Tumble dry low or hang-dry for longest life. Do not iron directly on the print, and avoid dry cleaning."
        },
        {
            question: "Do you offer bulk discounts?",
            answer: "Yes! If you're looking to order 50+ items for a team or event, please reach out to our support team for a custom quote."
        },
        {
            question: "What file formats do you accept for custom designs?",
            answer: "High-resolution transparent PNGs (300 DPI) are recommended for the best print quality. SVGs are also supported for vector graphics."
        }
    ];

    return (
        <div className="bg-white dark:bg-black min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Frequently Asked Questions</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Everything you need to know
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Can't find the answer you're looking for? Reach out to our customer support team.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl divide-y divide-gray-900/10 dark:divide-zinc-800">
                    <dl className="mt-10 space-y-6 divide-y divide-gray-900/10 dark:divide-zinc-800">
                        {faqs.map((faq, index) => (
                            <details key={index} className="group pt-6">
                                <summary className="flex w-full items-start justify-between text-left text-gray-900 dark:text-gray-200 cursor-pointer list-none">
                                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                                    <span className="ml-6 flex h-7 items-center">
                                        <svg className="h-6 w-6 rotate-0 transform text-gray-400 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </span>
                                </summary>
                                <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400 pb-4 pr-12">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
