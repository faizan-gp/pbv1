'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface SizeGuideRow {
    size: string;
    width: string;
    length: string;
    [key: string]: string; // Allow flexible columns if needed later
}

interface SizeGuideProps {
    data: {
        imperial: SizeGuideRow[];
        metric: SizeGuideRow[];
    };
    onChange: (newData: { imperial: SizeGuideRow[]; metric: SizeGuideRow[] }) => void;
}

export default function SizeGuideEditor({ data, onChange }: SizeGuideProps) {
    const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

    const activeRows = unit === 'imperial' ? data.imperial : data.metric;

    const handleCellChange = (rowIndex: number, field: string, value: string) => {
        const newRows = [...activeRows];
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };

        let newData = {
            ...data,
            [unit]: newRows
        };

        // Auto-convert Imperial -> Metric
        if (unit === 'imperial' && (field === 'width' || field === 'length') && value) {
            const numVal = parseFloat(value);
            if (!isNaN(numVal)) {
                // 1 inch = 2.54 cm
                const cmVal = (numVal * 2.54).toFixed(2);

                // Clone metric rows
                const newMetricRows = [...data.metric];
                // Ensure row exists in metric
                if (!newMetricRows[rowIndex]) {
                    newMetricRows[rowIndex] = { size: newRows[rowIndex].size || '', width: '', length: '' };
                }

                newMetricRows[rowIndex] = {
                    ...newMetricRows[rowIndex],
                    [field]: cmVal
                };

                newData = {
                    ...newData,
                    metric: newMetricRows
                };
            }
        }

        // Also sync 'size' label if changed in imperial
        if (unit === 'imperial' && field === 'size') {
            const newMetricRows = [...data.metric];
            if (!newMetricRows[rowIndex]) {
                newMetricRows[rowIndex] = { size: value, width: '', length: '' };
            } else {
                newMetricRows[rowIndex] = { ...newMetricRows[rowIndex], size: value };
            }
            newData = { ...newData, metric: newMetricRows };
        }

        onChange(newData);
    };

    const addRow = () => {
        const newRow = { size: 'New', width: '0', length: '0' };
        // Add to both to keep in sync
        onChange({
            imperial: [...data.imperial, newRow],
            metric: [...data.metric, newRow]
        });
    };

    const removeRow = (index: number) => {
        onChange({
            imperial: data.imperial.filter((_, i) => i !== index),
            metric: data.metric.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setUnit('imperial')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${unit === 'imperial' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Imperial (Inches)
                </button>
                <button
                    onClick={() => setUnit('metric')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${unit === 'metric' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Metric (cm)
                </button>
            </div>

            {/* Table */}
            <div className="p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 font-medium text-gray-500 w-1/4">Size</th>
                                <th className="text-left py-2 font-medium text-gray-500 w-1/3">Width</th>
                                <th className="text-left py-2 font-medium text-gray-500 w-1/3">Length</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="space-y-1">
                            {activeRows.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50">
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            value={row.size}
                                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                                            className="w-full border border-gray-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 font-medium"
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="number"
                                            value={row.width}
                                            onChange={(e) => handleCellChange(idx, 'width', e.target.value)}
                                            className="w-full border border-gray-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-700"
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input
                                            type="number"
                                            value={row.length}
                                            onChange={(e) => handleCellChange(idx, 'length', e.target.value)}
                                            className="w-full border border-gray-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-700"
                                        />
                                    </td>
                                    <td className="p-1 text-center">
                                        <button
                                            onClick={() => removeRow(idx)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-center">
                    <button
                        onClick={addRow}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    >
                        <Plus size={16} />
                        Add Size Row
                    </button>
                </div>
            </div>
        </div>
    );
}
