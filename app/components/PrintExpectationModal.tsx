'use client';

import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PrintExpectationModalProps {
    previewImage: string;
    realImage: string;
    onClose: () => void;
}

export default function PrintExpectationModal({ previewImage, realImage, onClose }: PrintExpectationModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Small delay to animate in
        const timer = setTimeout(() => setIsOpen(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300",
            isOpen ? "visible" : "invisible"
        )}>
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className={cn(
                "bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 transform",
                isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
            )}>
                {/* Header */}
                <div className="p-8 pb-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                        <ArrowRight size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Editor vs. Reality</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        The design editor shows a digital approximation. The final print will blend naturally with the fabric for a premium, retail-quality finish.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-gray-100">
                    {/* Left: Digital Preview */}
                    <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            What you see in Editor
                        </div>
                        <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <img
                                src={previewImage}
                                alt="Digital Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-3 right-3 text-center">
                                <span className="inline-block px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-white">
                                    Digital Overlay
                                </span>
                            </div>
                        </div>
                        <ul className="mt-6 space-y-2 text-sm text-gray-500 w-full max-w-[300px]">
                            <li className="flex gap-2">
                                <X size={16} className="text-red-400 shrink-0" />
                                <span>Flat, perfect colors</span>
                            </li>
                            <li className="flex gap-2">
                                <X size={16} className="text-red-400 shrink-0" />
                                <span>No fabric texture visible</span>
                            </li>
                            <li className="flex gap-2">
                                <X size={16} className="text-red-400 shrink-0" />
                                <span>"Sticker" like appearance</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right: Real Print */}
                    <div className="p-6 md:p-8 bg-white flex flex-col items-center">
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm text-xs font-bold text-indigo-700 uppercase tracking-wide animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                            What you get (Real Print)
                        </div>
                        <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-xl border-4 border-indigo-50 ring-4 ring-indigo-500/10 transform md:scale-105 transition-transform duration-500">
                            <img
                                src={realImage}
                                alt="Real DTG Print"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-3 right-3 text-center">
                                <span className="inline-block px-2 py-1 bg-indigo-600/90 backdrop-blur-md rounded text-[10px] font-bold text-white shadow-sm">
                                    Premium DTG Print
                                </span>
                            </div>
                        </div>
                        <ul className="mt-6 space-y-2 text-sm text-gray-600 w-full max-w-[300px]">
                            <li className="flex gap-2">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>Ink absorbs into fabric</span>
                            </li>
                            <li className="flex gap-2">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>Soft, breathable feel</span>
                            </li>
                            <li className="flex gap-2">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>Vintage/Natural look</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 bg-gray-50 flex justify-center">
                    <button
                        onClick={handleClose}
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full md:w-auto min-w-[200px]"
                    >
                        I Understand, Let's Design
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Close Button details */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
