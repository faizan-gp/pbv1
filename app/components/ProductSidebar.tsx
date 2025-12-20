'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductFilters from './ProductFilters';

export default function ProductSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <aside className="w-full lg:w-72 flex-none">
            <div className="sticky top-28 space-y-8">

                {/* Mobile Filter Toggle */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-indigo-600" /> Filters
                    </span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Desktop Content (Visible only on LG+) */}
                <div className="hidden lg:block bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
                        <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-slate-900">Refine Selection</h2>
                    </div>

                    <ProductFilters />

                    {/* Promo Box */}
                    <div className="mt-8 p-4 bg-indigo-900 rounded-xl text-white relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="text-xs font-bold opacity-70 mb-1 uppercase tracking-wider">Need Help?</div>
                            <div className="font-bold text-lg leading-tight mb-2">Not sure which fabric to pick?</div>
                            <div className="text-xs underline underline-offset-4">Read our Fabric Guide</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer (Portal) */}
                {mounted && isOpen && createPortal(
                    <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200">
                        <div className="p-6 flex-1 overflow-y-auto">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900">Refine Results</h2>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <ProductFilters />
                            </div>

                            {/* Mobile Done Button */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Show Results
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </aside>
    );
}
