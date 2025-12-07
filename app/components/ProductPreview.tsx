'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Product, ProductColor } from '../data/products';

interface ProductPreviewProps {
    designTextureUrl: string | null;
    product: Product;
    selectedColor: ProductColor;
    activeViewId: string;
    onViewChange: (id: string) => void;
}

export default function ProductPreview({ designTextureUrl, product, selectedColor, activeViewId, onViewChange }: ProductPreviewProps) {
    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const [showGrid, setShowGrid] = React.useState(false);

    // Calculate percentage positioning for the overlay
    const currentZone = activePreview.previewZone || product.designZone;
    const zoneStyle = {
        left: `${(currentZone.left / product.canvasSize) * 100}%`,
        top: `${(currentZone.top / product.canvasSize) * 100}%`,
        width: `${(currentZone.width / product.canvasSize) * 100}%`,
        height: `${(currentZone.height / product.canvasSize) * 100}%`,
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Controls */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</span>
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className="text-xs font-medium text-indigo-600 flex items-center gap-1 hover:text-indigo-800"
                >
                    {showGrid ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showGrid ? 'Hide Grid' : 'Show Grid'}
                </button>
            </div>

            {/* The Image Container */}
            <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
                <div className="relative w-full aspect-square max-w-[300px]">

                    {/* 1. Base Image (The Shirt) */}
                    <img
                        src={selectedColor.images[activeViewId] || selectedColor.images['front']}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />

                    {/* 2. Grid Overlay (Optional) */}
                    {showGrid && (
                        <div
                            className="absolute z-30 border-2 border-dashed border-indigo-400/50 bg-indigo-500/5 pointer-events-none"
                            style={zoneStyle}
                        />
                    )}

                    {/* 3. The Generated Design */}
                    {designTextureUrl && (
                        <img
                            src={designTextureUrl}
                            alt="Design Overlay"
                            className="absolute z-20 pointer-events-none"
                            style={{
                                ...zoneStyle,
                                mixBlendMode: 'multiply', // This blends the ink into the fabric texture
                                opacity: 0.9,
                                transform: activePreview.cssTransform || 'none',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Footer / View Selector */}
            {product.previews.length > 1 && (
                <div className="p-4 bg-white border-t border-slate-100 flex justify-center gap-2">
                    {product.previews.map((preview) => (
                        <button
                            key={preview.id}
                            onClick={() => onViewChange(preview.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeViewId === preview.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {preview.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}