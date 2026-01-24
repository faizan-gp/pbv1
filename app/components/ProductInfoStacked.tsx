'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductInfoStackedProps {
    shortDescription?: string;
    bulletPoints?: string[];
    description?: string;
    features?: { title: string; description: string; image?: string }[];
    careInstructions?: string[];
    sizeGuide?: { imperial: any[]; metric: any[] };
}

export default function ProductInfoStacked({ shortDescription, bulletPoints, description, features, careInstructions, sizeGuide }: ProductInfoStackedProps) {
    const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');

    return (
        <div className="space-y-12">
            {/* Description Section */}
            {(shortDescription || description) && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Overview</h3>
                    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 leading-relaxed">
                        {shortDescription && <p className="font-medium text-slate-800">{shortDescription}</p>}
                        {bulletPoints && bulletPoints.length > 0 && (
                            <ul className="space-y-2 mt-4">
                                {bulletPoints.map((point, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {description && <p>{description}</p>}
                    </div>
                </div>
            )}

            {/* Features Section */}
            {features && features.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Key Features</h3>
                    <div className="grid gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-1.5 text-sm">
                                    {feature.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Guide Section */}
            {sizeGuide && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-xl font-bold text-slate-900">Size Guide</h3>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setMeasurementUnit('imperial')}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", measurementUnit === 'imperial' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Imperial
                            </button>
                            <button
                                onClick={() => setMeasurementUnit('metric')}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", measurementUnit === 'metric' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Metric
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Size</th>
                                    <th className="px-6 py-4">Width ({measurementUnit === 'imperial' ? 'in' : 'cm'})</th>
                                    <th className="px-6 py-4">Length ({measurementUnit === 'imperial' ? 'in' : 'cm'})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {(sizeGuide[measurementUnit] || []).map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-900">{row.size}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.width}"</td>
                                        <td className="px-6 py-4 text-slate-600">{row.length}"</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
