'use client';

import React, { useState } from 'react';
import {
    Mail, Send, HelpCircle, MessageSquare, AlertCircle,
    ArrowRight, CheckCircle2, Clock, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { trackEvent, fbTrack } from '@/lib/analytics';

// FAQ Data
const faqs = [
    {
        icon: Clock,
        question: "Production Time?",
        answer: "Orders ship within 2-5 business days."
    },
    {
        icon: Package,
        question: "Returns?",
        answer: "We replace damaged or defective goods."
    },
    {
        icon: Send,
        question: "Tracking?",
        answer: "Emailed automatically upon shipping."
    },
];

export default function ContactContent() {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'Order Status',
        orderId: '',
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

            showToast('Message sent! Check your email soon.', 'success');

            trackEvent('contact', { method: 'email', topic: formData.topic });
            fbTrack('Contact', {});

            setFormData({ name: '', email: '', topic: 'Order Status', orderId: '', message: '' });
        } catch (error) {
            console.error(error);
            showToast('Something went wrong. Try emailing us.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-24">

            {/* --- HERO SECTION --- */}
            <div className="relative isolate overflow-hidden pt-14 pb-24 sm:pb-32">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.white))]" />
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />
                <div className="absolute inset-0 -z-20 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                        Support Center
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
                        We're Here to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                            Help You.
                        </span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Have a question about your custom order or just want to say hello?
                        Drop us a message and we'll get back to you within 24 hours.
                    </p>
                </div>
            </div>

            {/* --- MAIN CARD --- */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col lg:flex-row"
                >

                    {/* LEFT SIDE: FORM */}
                    <div className="flex-1 p-8 lg:p-16">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Send a Message</h2>
                            <p className="text-slate-500">Fill out the form below and we'll follow up via email.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic</label>
                                    <div className="relative">
                                        <select
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Order Status</option>
                                            <option>Returns & Refunds</option>
                                            <option>Product Quality Issue</option>
                                            <option>General Inquiry</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Order ID <span className="text-slate-300 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="orderId"
                                        value={formData.orderId}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                        placeholder="#12345"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
                                <textarea
                                    name="message"
                                    rows={5}
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                    placeholder="How can we help you today?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span>Sending...</span>
                                ) : (
                                    <>
                                        Send Message <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-start gap-2 text-xs text-slate-400 mt-4 bg-slate-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                                <span>Note: For damaged items, please email us directly with photos attached, as this form supports text only.</span>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT SIDE: INFO & FAQ */}
                    <div className="lg:w-[400px] bg-slate-900 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <h3 className="text-white font-black text-xl mb-6">Contact Info</h3>

                            <div className="space-y-6 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Us</p>
                                        <a href="mailto:hello@printbrawl.com" className="text-white font-bold hover:text-indigo-400 transition-colors">hello@printbrawl.com</a>
                                        <p className="text-slate-500 text-sm mt-1">Response within 24 hours</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-green-400 shrink-0">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-white font-bold">Systems Operational</p>
                                        <p className="text-slate-500 text-sm mt-1">Accepting new orders</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-white font-black text-xl mb-6 flex items-center gap-2">
                                <HelpCircle size={20} className="text-indigo-400" /> FAQ
                            </h3>

                            <div className="space-y-4">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <faq.icon size={14} className="text-indigo-400" />
                                            <span className="text-white font-bold text-sm">{faq.question}</span>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                            <p className="text-slate-500 text-xs">
                                &copy; {new Date().getFullYear()} Print Brawl Inc.<br />
                                Designed for creativity.
                            </p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}