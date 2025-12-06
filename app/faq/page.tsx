import React from 'react';

export default function FAQPage() {
    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 5-7 business days within the US. International shipping can take 10-15 business days depending on the destination."
        },
        {
            question: "What is your return policy?",
            answer: "Since all our products are custom-made to order, we only accept returns for defective or damaged items. If you have an issue with your order, please contact us within 14 days of delivery."
        },
        {
            question: "Can I cancel or change my order?",
            answer: "We process orders quickly to get them to you as soon as possible. You can request a cancellation or change within 2 hours of placing your order. After that, production may have already begun."
        },
        {
            question: "How do I care for my custom printed apparel?",
            answer: "To ensure longevity, machine wash cold inside out with like colors. Tumble dry low or hang dry. Do not iron directly on the print."
        },
        {
            question: "Do you offer bulk discounts?",
            answer: "Yes! We offer tiered pricing for bulk orders. Please contact our sales team for a custom quote for orders over 50 items."
        },
        {
            question: "What file formats do you accept for custom designs?",
            answer: "We recommend high-resolution PNG or SVG files with transparent backgrounds for the best results. JPEG is also accepted but may have a white background if not properly formatted."
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
