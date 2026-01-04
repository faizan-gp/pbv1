'use client';

import React, { useState } from 'react';
import { Mail, Send, HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Simple FAQ data to make the page more useful/unique
const faqs = [
    { question: "What is the standard production time?", answer: "Most orders are printed and shipped within 2-5 business days." },
    { question: "Can I return custom items?", answer: "Because items are made-to-order, we only accept returns for damaged or defective goods." },
    { question: "Where is my tracking number?", answer: "Tracking is emailed automatically as soon as the shipping label is generated." },
];

export default function ContactContent() {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'Order Status', // Added a topic selector
        orderId: '', // Added Order ID field
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'contact_messages'), {
                ...formData,
                timestamp: serverTimestamp(),
                status: 'unread'
            });

            showToast('Message sent! We will get back to you on your given email.', 'success');
            setFormData({ name: '', email: '', topic: 'Order Status', orderId: '', message: '' });
        } catch (error) {
            console.error(error);
            showToast('Something went wrong. Please try emailing us directly.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            <div className="bg-indigo-900 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Contact Support</h1>
                    <p className="mt-6 text-lg leading-8 text-indigo-200 max-w-2xl mx-auto">
                        We are a digital-first team. The fastest way to get help with your Print Brawl order is via the form below or direct email.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 sm:-mt-16 pb-24">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">

                    {/* Left Column: Contact Info & FAQ */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Email Card */}
                        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/10">
                            <div className="flex items-center gap-x-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                For general inquiries, partnership opportunities, or if you prefer using your own mail client.
                            </p>
                            <a
                                href="mailto:hello@printbrawl.com"
                                className="text-indigo-600 font-semibold hover:text-indigo-500 flex items-center gap-2"
                            >
                                hello@printbrawl.com <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>

                        {/* FAQ Mini Section */}
                        <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-900/5">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                                <HelpCircle className="h-5 w-5 text-gray-400" />
                                Quick Answers
                            </h3>
                            <dl className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index}>
                                        <dt className="font-medium text-gray-900 text-sm">{faq.question}</dt>
                                        <dd className="mt-1 text-sm text-gray-600">{faq.answer}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/10 p-8 sm:p-12">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                                <p className="mt-2 text-gray-600">Please include your Order ID if this is regarding an existing purchase.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-semibold leading-6 text-gray-900">Topic</label>
                                        <select
                                            id="topic"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        >
                                            <option>Order Status</option>
                                            <option>Returns & Refunds</option>
                                            <option>Product Quality Issue</option>
                                            <option>General Inquiry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="orderId" className="block text-sm font-semibold leading-6 text-gray-900">
                                            Order ID <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="orderId"
                                            id="orderId"
                                            placeholder="#12345"
                                            value={formData.orderId}
                                            onChange={handleChange}
                                            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex w-full sm:w-auto justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                                    >
                                        {isSubmitting ? 'Sending...' : (
                                            <>
                                                Send Message <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Extra help note */}
                        <div className="mt-6 flex items-start gap-3 text-sm text-gray-500 px-4">
                            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p>For damaged items, please email us directly with photos attached, as our form currently supports text only.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}