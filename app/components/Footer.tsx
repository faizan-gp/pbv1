import { ShieldCheck, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 py-16 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-sm font-medium text-gray-900">
                        © {new Date().getFullYear()} PrintBrawl
                    </p>
                    <p className="text-xs text-gray-500">
                        Premium Custom Apparel
                    </p>
                    <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Ships to USA Only
                    </p>
                    <a href="/dmca" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                        <ShieldCheck size={12} className="text-indigo-500" />
                        DMCA Protected
                    </a>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-6 w-full sm:w-auto">
                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a href="https://twitter.com/printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="Twitter">
                            <Twitter size={18} />
                        </a>
                        <a href="https://facebook.com/printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="Facebook">
                            <Facebook size={18} />
                        </a>
                        <a href="https://instagram.com/printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="Instagram">
                            <Instagram size={18} />
                        </a>
                        <a href="https://pinterest.com/printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="Pinterest">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M8 14.5c2.5 3.3 10 7 2.6-9.5A6 6 0 0 0 5 11.2c0 1.2.6 2.3 1 3.2.3.6.1 1.6-.4 2.1-1.2 1.2-3.8-3-2-7 1.8-4.2 8.7-4.6 10.2 1.1.9 3.4-1.3 6.9-4.7 6.9-1.5 0-2.6-.8-3-1.6l-.8 3.2c-.3 1.1-1.1 2.5-1.7 3.4" /></svg>
                        </a>
                        <a href="https://tiktok.com/@printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="TikTok">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                        </a>
                        <a href="https://linkedin.com/company/printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="LinkedIn">
                            <Linkedin size={18} />
                        </a>
                        <a href="https://youtube.com/@printbrawl" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm hover:border-indigo-100" aria-label="YouTube">
                            <Youtube size={18} />
                        </a>
                    </div>

                    <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-8 text-center text-xs font-bold uppercase tracking-wider w-full sm:w-auto">
                        <a href="/about" className="text-gray-500 transition-colors hover:text-indigo-600">About</a>
                        <a href="/team" className="text-gray-500 transition-colors hover:text-indigo-600">Team</a>
                        <a href="/guides" className="text-gray-500 transition-colors hover:text-indigo-600">Guides</a>
                        <a href="/faq" className="text-gray-500 transition-colors hover:text-indigo-600">FAQ</a>
                        <a href="/contact" className="text-gray-500 transition-colors hover:text-indigo-600">Contact</a>
                        <a href="/site-map" className="text-gray-500 transition-colors hover:text-indigo-600">Sitemap</a>
                        <div className="hidden sm:block h-3 w-px bg-gray-300 mx-2"></div>
                        <a href="/privacy-policy" className="text-gray-500 transition-colors hover:text-indigo-600">Privacy</a>
                        <a href="/terms-of-service" className="text-gray-500 transition-colors hover:text-indigo-600">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
