import { ShieldCheck } from "lucide-react";

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

                <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-8 text-center w-full sm:w-auto">
                    <a href="/about" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        About
                    </a>
                    <a href="/team" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Team
                    </a>
                    <a href="/guides" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Guides
                    </a>
                    <a href="/faq" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        FAQ
                    </a>
                    <a href="/contact" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Contact
                    </a>
                    <a href="/site-map" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Sitemap
                    </a>

                    {/* Divider for desktop */}
                    <div className="hidden sm:block h-4 w-px bg-gray-300 mx-2"></div>

                    <a href="/privacy-policy" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Privacy
                    </a>
                    <a href="/terms-of-service" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Terms
                    </a>
                </div>
            </div>
        </footer>
    );
}
