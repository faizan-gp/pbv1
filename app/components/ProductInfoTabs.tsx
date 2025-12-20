'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Ruler, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductInfoTabsProps {
    description?: string;
    features?: { title: string; description: string; icon?: string }[];
    careInstructions?: string[];
    sizeGuide?: { imperial: any[]; metric: any[] };
}

export default function ProductInfoTabs({ description, features, careInstructions, sizeGuide }: ProductInfoTabsProps) {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { id: 'details', label: 'Overview', show: !!description },
        { id: 'features', label: 'Features', show: features && features.length > 0 },
        { id: 'size', label: 'Size Guide', show: !!sizeGuide },
    ].filter(tab => tab.show);

    if (tabs.length === 0) return null;

    return (
        <div className="w-full">
            {/* Pill Navigation */}
            <div className="inline-flex p-1.5 bg-slate-100 rounded-xl mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative px-5 py-2.5 text-sm font-bold rounded-lg transition-colors z-10",
                            activeTab === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabPill"
                                className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/60 -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Animated Content */}
            <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'details' && description && (
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                                <p>{description}</p>
                            </div>
                        )}

                        {activeTab === 'features' && features && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                            <Check className="w-4 h-4 text-indigo-600" /> {feature.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'size' && sizeGuide && (
                            <div className="overflow-hidden border border-slate-200 rounded-2xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Size</th>
                                            <th className="px-6 py-4">Width (in)</th>
                                            <th className="px-6 py-4">Length (in)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {(sizeGuide.imperial || []).map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold text-slate-900">{row.size}</td>
                                                <td className="px-6 py-4 text-slate-600">{row.width}"</td>
                                                <td className="px-6 py-4 text-slate-600">{row.length}"</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}