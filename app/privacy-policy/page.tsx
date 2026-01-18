
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-500 selection:text-white">
            {/* Header / Hero */}
            <div className="relative bg-slate-50 border-b border-slate-100 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.4] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply pointer-events-none"></div>
                {/* Gradient Blob */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="container-width relative z-10 px-6 py-20 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-900 text-xs font-bold uppercase tracking-wider mb-8">
                        Legal Documentation
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                        Privacy Policy
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Transparency is key. Here's how we handle your data with care and security.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container-width max-w-4xl px-6 py-20">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sticky Sidebar (Table of Contents style or Quick Info) */}
                    <div className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-32 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Last Updated</h3>
                                <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-900">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact</h3>
                                <a href="mailto:hello@printbrawl.com" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline decoration-2 underline-offset-2">
                                    hello@printbrawl.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Main Text */}
                    <div className="flex-1">
                        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-500">
                            <p className="lead text-xl md:text-2xl text-slate-900 font-bold mb-12">
                                At Print Brawl, we respect your privacy and are committed to protecting the personal information you share with us.
                            </p>

                            <h3>1. Information We Collect</h3>
                            <p>We believe in collecting only what's necessary to provide you with an exceptional custom printing experience.</p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li><strong>Order Information:</strong> When you purchase, we collect your name, shipping address, and email to ensure your gear reaches you.</li>
                                <li><strong>Design Assets:</strong> Your creativity is safe with us. We store your uploaded designs purely for fulfillment.</li>
                                <li><strong>Payment Security:</strong> We do <strong>not</strong> touch your credit card data. All payments are encrypted and handled by Stripe/PayPal.</li>
                            </ul>

                            <h3>2. How We Use Your Data</h3>
                            <p>Everything we collect serves a direct purpose:</p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li><strong>Fulfillment:</strong> To print, pack, and ship your custom items.</li>
                                <li><strong>Communication:</strong> To send order updates and support responses.</li>
                                <li><strong>Improvement:</strong> To understand what products you love most.</li>
                            </ul>

                            <div className="my-8 p-6 bg-slate-900 rounded-2xl text-white not-prose">
                                <h4 className="flex items-center gap-2 text-lg font-bold mb-2">
                                    <span className="text-indigo-400">★</span> Our Promise
                                </h4>
                                <p className="text-slate-300">
                                    We will never sell your personal data to advertisers or third parties. Your information belongs to you.
                                </p>
                            </div>

                            <h3>3. Third-Party Sharing</h3>
                            <p>
                                We partner only with trusted services essential to our operation:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li><strong>Print Providers:</strong> Our network of high-quality print shops.</li>
                                <li><strong>Couriers:</strong> USPS, FedEx, and UPS for delivery.</li>
                            </ul>

                            <h3>4. Cookies & Experience</h3>
                            <p>
                                We use cookies for two things: keeping your cart saved and understanding general site traffic. You can control cookies through your browser settings, though it may affect cart functionality.
                            </p>

                            <h3>5. Security Measures</h3>
                            <p>
                                Your data is encrypted in transit and at rest. We use industry-standard SSL technology to keep your connection secure. While no online service is impenetrable, we treat security as a top priority.
                            </p>

                            <h3>6. Your Rights</h3>
                            <p>
                                You have the right to access, download, or delete your personal data. Simply reach out to our team, and we'll handle your request in compliance with GDPR and CCPA regulations.
                            </p>
                        </div>

                        <div className="mt-16 pt-10 border-t border-slate-100">
                            <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Have questions?</h4>
                            <p className="text-lg text-slate-600 mb-6">
                                If anything in this policy is unclear, our Data Privacy Officer is here to help.
                            </p>
                            <a href="mailto:hello@printbrawl.com" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                                Contact Privacy Team
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
