'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Ruler, FileText, ChevronDown, Hexagon, Shirt, Zap, Wind, Sun, Feather, Maximize, Droplets, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
    check: Check,
    hexagon: Hexagon,
    shirt: Shirt,
    shield: Shield,
    zap: Zap,
    wind: Wind,
    sun: Sun,
    feather: Feather,
    maximize: Maximize,
    droplets: Droplets,
    award: Award,
};

interface ProductInfoTabsProps {
    description?: string;
    features?: { title: string; description: string; icon?: string }[];
    careInstructions?: string[];
    sizeGuide?: { imperial: any[]; metric: any[] };
}

export default function ProductInfoTabs({ description, features, careInstructions, sizeGuide }: ProductInfoTabsProps) {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { id: 'details', label: 'Details', icon: FileText, show: !!description },
        { id: 'features', label: 'Features', icon: Check, show: features && features.length > 0 },
        { id: 'care', label: 'Care', icon: Shield, show: careInstructions && careInstructions.length > 0 },
        { id: 'size', label: 'Size Guide', icon: Ruler, show: !!sizeGuide },
    ].filter(tab => tab.show);

    if (tabs.length === 0) return null;

    return (
        <div className="w-full mt-8">
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative outline-none whitespace-nowrap",
                            activeTab === tab.id
                                ? "text-indigo-600"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="py-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'details' && description && (
                            <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed">
                                <p>{description}</p>
                            </div>
                        )}

                        {activeTab === 'features' && features && (
                            <div className="grid grid-cols-1 gap-4">
                                {features.map((feature, idx) => {
                                    const IconComponent = ICON_MAP[feature.icon?.toLowerCase() || 'check'] || Check;
                                    return (
                                        <div key={idx} className="group flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                                            <div className="flex-none p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-gray-100">
                                                <IconComponent size={18} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'care' && careInstructions && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <ul className="space-y-4">
                                    {careInstructions.map((inst, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-none" />
                                            {inst}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'size' && sizeGuide && (
                            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-center">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Size</th>
                                                <th className="px-6 py-4">Width (in)</th>
                                                <th className="px-6 py-4">Length (in)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {(sizeGuide.imperial || []).map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900 text-left">{row.size}</td>
                                                    <td className="px-6 py-4 text-gray-500">{row.width}"</td>
                                                    <td className="px-6 py-4 text-gray-500">{row.length}"</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-center text-gray-400">
                                    Measurements are provided by suppliers and may vary slightly.
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
