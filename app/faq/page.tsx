import React from 'react';
import { Metadata } from 'next';
import FAQSchema from '@/app/components/seo/FAQSchema';

export const metadata: Metadata = {
    title: "FAQ | Common Questions - Print Brawl",
    description: "Get answers to common questions about shipping, returns, and how to create your own custom products.",
    openGraph: {
        title: "Frequently Asked Questions",
        description: "Everything you need to know about creating custom apparel with Print Brawl.",
    }
};

export default function FAQPage() {
    const faqs = [
        {
            question: "How long until I get my order?",
            answer: "Since you designed it, we make it just for you! Production typically takes 2-5 business days. After that, standard shipping is usually 3-5 days. You'll get a tracking number as soon as it leaves our facility."
        },
        {
            question: "Can I return my custom item?",
            answer: "Because your item is unique to you, we can't accept returns for changing your mind. However, if there's any print issue or defect, we'll absolutely replace it for free. Your happiness with your creation is our priority."
        },
        {
            question: "I made a mistake in my design! Can I change it?",
            answer: "We start working on your creation almost immediately to get it to you fast. Please verify your design carefully before checking out, as we usually cannot modify orders once placed."
        },
        {
            question: "How do I keep my print looking great?",
            answer: "To keep your custom gear looking fresh, machine wash cold, inside-out. Tumble dry on low. It's built to last, but a little care goes a long way."
        },
        {
            question: "Do you offer discounts for group orders?",
            answer: "Absolutely! If you're planning a family reunion, bachelorette party, or team event and need 10+ items, let us know. We love helping you celebrate together."
        },
        {
            question: "What's the best image quality to upload?",
            answer: "For the crispest print, use a high-quality PNG or JPEG. If it looks blurry on your screen, it might look blurry on the shirt. Our studio tool will warn you if the quality seems too low!"
        }
    ];

    return (
        <div className="bg-white min-h-screen py-24 sm:py-32">
            <FAQSchema items={faqs} />
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Frequently Asked Questions</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need to know
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Can't find the answer you're looking for? Reach out to our customer support team.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl divide-y divide-gray-900/10">
                    <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                        {faqs.map((faq, index) => (
                            <details key={index} className="group pt-6">
                                <summary className="flex w-full items-start justify-between text-left text-gray-900 cursor-pointer list-none">
                                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                                    <span className="ml-6 flex h-7 items-center">
                                        <svg className="h-6 w-6 rotate-0 transform text-gray-400 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </span>
                                </summary>
                                <p className="mt-2 text-base leading-7 text-gray-600 pb-4 pr-12">
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
