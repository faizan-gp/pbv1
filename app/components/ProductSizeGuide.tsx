'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductSizeGuideProps {
    sizeGuide?: { imperial: any[]; metric: any[] };
}

export default function ProductSizeGuide({ sizeGuide }: ProductSizeGuideProps) {
    const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');

    if (!sizeGuide) return null;

    // Default to Width/Length if no columns specified (backward compatibility)
    let columns = (sizeGuide as any).columns || ['Width', 'Length'];

    // Force sort: Width, Length, others
    columns = [...columns].sort((a: string, b: string) => {
        const priority = (name: string) => {
            const lowered = name.toLowerCase();
            if (lowered === 'width') return -2;
            if (lowered === 'length') return -1;
            return 0;
        };
        return priority(a) - priority(b);
    });

    const activeRows = measurementUnit === 'imperial' ? sizeGuide.imperial : sizeGuide.metric;

    if (!activeRows || activeRows.length === 0) return null;

    return (
        <div className="space-y-4 pt-8 border-t border-slate-100">
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
                            {columns.map((col: string, i: number) => (
                                <th key={i} className="px-6 py-4">
                                    {col} ({measurementUnit === 'imperial' ? 'in' : 'cm'})
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {activeRows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-900">{row.size}</td>
                                {columns.map((col: string, j: number) => (
                                    <td key={j} className="px-6 py-4 text-slate-600">
                                        {row[col] !== undefined ? row[col] : '-'}
                                        {measurementUnit === 'imperial' && row[col] && '"'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
