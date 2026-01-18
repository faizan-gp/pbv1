
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms and conditions for using Print Brawl services.",
};

export default function TermsOfServicePage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        The fine print. Essential rules for using our platform.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container-width max-w-4xl px-6 py-20">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sticky Sidebar */}
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
                                Welcome to Print Brawl. By using our website and services, you agree to these terms. Please read them as they govern your rights and responsibilities.
                            </p>

                            <h3>1. Custom Products & Refund Policy</h3>
                            <p>
                                Because every product is custom-made to your specifications, <strong>all sales are final.</strong> We cannot offer returns or exchanges for "change of mind", incorrect size selection, or design errors made by you.
                            </p>

                            <div className="my-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl not-prose">
                                <h4 className="flex items-center gap-2 text-lg font-bold text-amber-900 mb-2">
                                    Defective Items Exception
                                </h4>
                                <p className="text-amber-800">
                                    If we made a mistake (print error, wrong item, damaged in transit), we've got you covered. Contact us within <strong>14 days</strong> of delivery with photos, and we'll send a free replacement.
                                </p>
                            </div>

                            <h3>2. User-Generated Content</h3>
                            <p>
                                When you upload a design ("User Content") to Print Brawl, you adhere to the following:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li><strong>Ownership:</strong> You confirm that you own the rights to your design or have explicit permission to use it.</li>
                                <li><strong>Responsibility:</strong> You indemnify Print Brawl from any legal claims arising from your content infringing on third-party copyrights or trademarks.</li>
                                <li><strong>Content Standards:</strong> We reserve the right to refuse printing hate speech, illegal imagery, or explicit copyright violations.</li>
                            </ul>

                            <h3>3. Color & Print Disclaimer</h3>
                            <p>
                                Digital screens show colors in RGB (emitted light), while fabrics are printed in CMYK (absorbed light). This means:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li>Colors may appear slightly differently on the final product than on your screen.</li>
                                <li>Print placement may vary slightly (approx. 1 inch) due to manual loading processes.</li>
                                <li>These minor variations are industry standards and not considered defects.</li>
                            </ul>

                            <h3>4. Shipping Strategy</h3>
                            <p>
                                We work fast, but shipping times are estimates. Once a package is handed to the carrier (USPS/FedEx/UPS), delays caused by weather or logistics are outside our control.
                            </p>

                            <h3>5. Limitation of Liability</h3>
                            <p>
                                To the fullest extent permitted by law, Print Brawl is not liable for indirect, incidental, or consequential damages arising from your use of our service. Our liability is limited to the amount you paid for the product.
                            </p>

                            <h3>6. Modifications</h3>
                            <p>
                                We may update these terms occasionally. Continuing to use Print Brawl after changes means you accept the new terms.
                            </p>
                        </div>

                        <div className="mt-16 pt-10 border-t border-slate-100">
                            <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Need clarification?</h4>
                            <p className="text-lg text-slate-600 mb-6">
                                Our support team is happy to explain any part of these terms.
                            </p>
                            <a href="mailto:hello@printbrawl.com" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
