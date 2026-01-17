'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SizeGuideRow {
    size: string;
    [key: string]: string;
}

interface SizeGuideData {
    imperial: SizeGuideRow[];
    metric: SizeGuideRow[];
    columns: string[];
}

interface SizeGuideProps {
    data: SizeGuideData;
    onChange: (newData: SizeGuideData) => void;
}

// -- Sortable Row Component --
function SortableRow({
    row,
    rowIndex,
    columns,
    handleCellChange,
    removeRow
}: {
    row: SizeGuideRow;
    rowIndex: number;
    columns: string[];
    handleCellChange: (index: number, field: string, value: string) => void;
    removeRow: (index: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `row-${rowIndex}` }); // Using index-based ID for simplicity here, ideally should be unique ID

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' as const : undefined,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`group ${isDragging ? 'bg-indigo-50 shadow-md' : 'hover:bg-gray-50'}`}
        >
            <td className="p-2 w-10 text-center cursor-grab active:cursor-grabbing touch-none" {...attributes} {...listeners}>
                <GripVertical size={16} className="text-gray-300 hover:text-gray-500 mx-auto" />
            </td>
            <td className="p-2">
                <input
                    type="text"
                    value={row.size}
                    onChange={(e) => handleCellChange(rowIndex, 'size', e.target.value)}
                    className="w-full bg-transparent font-bold text-gray-900 outline-none border-b border-transparent focus:border-indigo-500"
                />
            </td>
            {columns.map((col, i) => (
                <td key={i} className="p-2">
                    <input
                        type="text"
                        value={row[col] || ''}
                        onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                        className="w-full bg-transparent text-gray-600 outline-none border-b border-transparent focus:border-indigo-500"
                    />
                </td>
            ))}
            <td className="p-2 text-center">
                <button onClick={() => removeRow(rowIndex)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
            </td>
        </tr>
    );
}

export default function SizeGuideEditor({ data, onChange }: SizeGuideProps) {
    const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

    // Ensure data integrity
    const columns = data.columns || ['Width', 'Length'];
    const activeRows = (unit === 'imperial' ? data.imperial : data.metric) || [];

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Extract indexes from IDs "row-0", "row-1"
            const oldIndex = parseInt((active.id as string).split('-')[1]);
            const newIndex = parseInt((over?.id as string).split('-')[1]);

            if (!isNaN(oldIndex) && !isNaN(newIndex)) {
                // Reorder both arrays to keep sync
                const newImperial = arrayMove(data.imperial || [], oldIndex, newIndex);
                const newMetric = arrayMove(data.metric || [], oldIndex, newIndex);

                onChange({
                    ...data,
                    imperial: newImperial,
                    metric: newMetric
                });
            }
        }
    };

    const handleCellChange = (rowIndex: number, field: string, value: string) => {
        const newData = { ...data };
        const newRows = [...(unit === 'imperial' ? data.imperial : data.metric) || []];

        // Update current VIEW data
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };

        if (unit === 'imperial') {
            newData.imperial = newRows;

            // Auto-convert number fields
            if (field !== 'size') {
                const numVal = parseFloat(value);
                if (!isNaN(numVal)) {
                    const cmVal = (numVal * 2.54).toFixed(2);

                    // Sync to Metric
                    const newMetricRows = [...(data.metric || [])];
                    // Ensure row exists
                    if (!newMetricRows[rowIndex]) {
                        newMetricRows[rowIndex] = { size: newRows[rowIndex].size };
                        columns.forEach(c => newMetricRows[rowIndex][c] = '');
                    }
                    newMetricRows[rowIndex] = { ...newMetricRows[rowIndex], [field]: cmVal };
                    newData.metric = newMetricRows;
                }
            }

            // Sync Size Label
            if (field === 'size') {
                const newMetricRows = [...(data.metric || [])];
                if (!newMetricRows[rowIndex]) {
                    newMetricRows[rowIndex] = { size: value };
                } else {
                    newMetricRows[rowIndex] = { ...newMetricRows[rowIndex], size: value };
                }
                newData.metric = newMetricRows;
            }

        } else {
            newData.metric = newRows;
        }

        onChange(newData);
    };

    const addRow = () => {
        const newRow: SizeGuideRow = { size: 'New' };
        columns.forEach(c => newRow[c] = '0');

        onChange({
            ...data,
            imperial: [...(data.imperial || []), { ...newRow }],
            metric: [...(data.metric || []), { ...newRow }]
        });
    };

    const addColumn = () => {
        const name = prompt("Enter column name (e.g. Sleeve)");
        if (name && !columns.includes(name)) {
            const newCols = [...columns, name];
            const updateRows = (rows: SizeGuideRow[]) => rows.map(r => ({ ...r, [name]: '0' }));
            onChange({
                ...data,
                columns: newCols,
                imperial: updateRows(data.imperial || []),
                metric: updateRows(data.metric || [])
            });
        }
    };

    const removeColumn = (colName: string) => {
        if (confirm(`Delete column ${colName}?`)) {
            const newCols = columns.filter(c => c !== colName);
            onChange({ ...data, columns: newCols });
        }
    };

    const removeRow = (index: number) => {
        onChange({
            ...data,
            imperial: (data.imperial || []).filter((_, i) => i !== index),
            metric: (data.metric || []).filter((_, i) => i !== index)
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
                <div className="flex gap-4">
                    <button onClick={() => setUnit('imperial')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${unit === 'imperial' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>Imperial (in)</button>
                    <button onClick={() => setUnit('metric')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${unit === 'metric' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>Metric (cm)</button>
                </div>

                <div className="flex gap-3 py-2">
                    <button onClick={addColumn} className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                        <Plus size={14} /> Col
                    </button>
                    <label className="flex items-center gap-1 text-xs font-bold text-indigo-600 cursor-pointer hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                        <Upload size={14} />
                        <span>Import</span>
                        <input type="file" className="hidden" accept=".json" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                // Re-using logic from prompt. Ideally this handler sits outside or is pure.
                                // For brevity, simplified here. 
                                // (Assume external handler or paste logic here similar to previous turn but keeping file structure mostly clean)
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    try {
                                        const json = JSON.parse(ev.target?.result as string);
                                        const fileColumns = Object.keys(json);
                                        const cleanColumns = fileColumns.map(k => k.replace(/,\s*in$/i, '').replace(/,\s*cm$/i, '').trim());
                                        const sizeSet = new Set<string>();
                                        fileColumns.forEach(col => Object.keys(json[col]).forEach(s => sizeSet.add(s)));
                                        const sortedSizes = Array.from(sizeSet); // Basic

                                        const newImperial = sortedSizes.map(size => {
                                            const r: any = { size };
                                            fileColumns.forEach((fc, i) => r[cleanColumns[i]] = json[fc][size] || '-');
                                            return r;
                                        });

                                        const newMetric = newImperial.map(imp => {
                                            const r: any = { size: imp.size };
                                            cleanColumns.forEach(c => {
                                                const val = parseFloat(imp[c]);
                                                r[c] = !isNaN(val) ? (val * 2.54).toFixed(2) : imp[c];
                                            });
                                            return r;
                                        });

                                        onChange({ columns: cleanColumns, imperial: newImperial, metric: newMetric });
                                    } catch (err) { alert('Invalid JSON'); }
                                };
                                reader.readAsText(file);
                            }
                        }} />
                    </label>
                </div>
            </div>

            {/* Dynamic Table with DnD */}
            <div className="p-4 overflow-x-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full text-sm table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                                <th className="w-10 py-2"></th>
                                <th className="text-left py-2 px-2 font-bold w-24">Size</th>
                                {columns.map((col, i) => (
                                    <th key={i} className="text-left py-2 px-2 font-bold min-w-[100px] group relative">
                                        {col}
                                        <button onClick={() => removeColumn(col)} className="absolute right-1 top-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                    </th>
                                ))}
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <SortableContext
                            items={activeRows.map((_, i) => `row-${i}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <tbody className="divide-y divide-gray-100">
                                {activeRows.map((row, idx) => (
                                    <SortableRow
                                        key={`row-${idx}`} // Note: Using index as ID is risky if removing, provided IDs are stable only for reorder. 
                                        // For mapped array without IDs, this is the standard limitation.
                                        // For best practice we should add IDs to row data, but ensuring compat with existing data:
                                        rowIndex={idx}
                                        row={row}
                                        columns={columns}
                                        handleCellChange={handleCellChange}
                                        removeRow={removeRow}
                                    />
                                ))}
                            </tbody>
                        </SortableContext>
                    </table>
                </DndContext>

                {activeRows.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No size data. Import JSON or add rows.</div>
                )}

                <div className="mt-4 flex justify-center">
                    <button onClick={addRow} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        <Plus size={16} /> Add Size Row
                    </button>
                </div>
            </div>
        </div>
    );
}
