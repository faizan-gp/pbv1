"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { trackEvent, fbTrackCustom } from "@/lib/analytics";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubscribe = () => {
        if (!email) return;

        // Track event
        trackEvent('newsletter_signup', { email });
        fbTrackCustom('NewsletterSignup', { email });

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000); // Reset after 5s or keep success state? Resetting allows re-entry if needed, or keep.
        // Let's keep it simple.
        setEmail("");
    };

    return (
        <section className="py-24 bg-white">
            <div className="container-width">
                <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-30 -translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 text-indigo-300 font-bold mb-4">
                                <Mail className="w-5 h-5" /> The Design Club
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Get 15% off your first order</h2>
                            <p className="text-slate-400 text-lg">Join 50,000+ creators getting weekly design tips, free assets, and exclusive discounts.</p>
                        </div>

                        <div className="w-full max-w-md">
                            {submitted ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 animate-in fade-in zoom-in">
                                    <div className="text-2xl mb-2">🎉</div>
                                    <h3 className="text-xl font-bold text-white mb-1">Welcome aboard!</h3>
                                    <p className="text-indigo-200 text-sm">Check your inbox for your 15% off code.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm transition-all"
                                        />
                                        <button
                                            onClick={handleSubscribe}
                                            disabled={!email}
                                            className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Subscribe
                                        </button>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-4 text-center sm:text-left">No spam. Unsubscribe anytime.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
