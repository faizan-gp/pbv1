'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function SizeChartModal({ isOpen, onClose, product }: SizeChartModalProps) {
    const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

    if (!isOpen) return null;

    const sizeData = product.sizeGuide?.[unit] || [];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Ruler size={20} /></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Size Chart</h3>
                            <p className="text-xs text-slate-400">Measurements in {unit === 'imperial' ? 'Inches' : 'Centimeters'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-slate-50/50">
                    {/* Unit Switcher */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 inline-flex">
                            <button
                                onClick={() => setUnit('imperial')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", unit === 'imperial' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Imperial
                            </button>
                            <button
                                onClick={() => setUnit('metric')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", unit === 'metric' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Metric
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Size</th>
                                        {/* Dynamic Columns */}
                                        {(() => {
                                            let columns = (product.sizeGuide as any)?.columns || ['Width', 'Length'];
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
                                            return columns.map((col: string) => (
                                                <th key={col} className="px-6 py-4">
                                                    {col} ({unit === 'imperial' ? 'in' : 'cm'})
                                                </th>
                                            ));
                                        })()}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {sizeData.map((row: any, i: number) => {
                                        // Logic to resolve columns same as header
                                        let columns = (product.sizeGuide as any)?.columns || ['Width', 'Length'];
                                        columns = [...columns].sort((a: string, b: string) => {
                                            const priority = (name: string) => {
                                                const lowered = name.toLowerCase();
                                                if (lowered === 'width') return -2;
                                                if (lowered === 'length') return -1;
                                                return 0;
                                            };
                                            return priority(a) - priority(b);
                                        });

                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">{row.size}</td>
                                                {columns.map((col: string) => (
                                                    <td key={col} className="px-6 py-4 text-slate-600 font-medium">
                                                        {row[col] !== undefined ? row[col] : '-'}
                                                        {unit === 'imperial' && row[col] && '"'}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                    {sizeData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                                No size information available for this product.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                        Product measurements may vary by up to 2" (5cm).
                    </p>
                </div>

                <div className="h-4 bg-white border-t border-slate-50" />
            </div>
        </div>
    );
}
