'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { cn } from '@/lib/utils';

interface ProductPreviewProps {
    designTextureUrl: string | null;
    product: Product;
    selectedColor: ProductColor;
    activeViewId: string;
    onViewChange: (id: string) => void;
    minimal?: boolean;
    className?: string;
}

export default function ProductPreview({
    designTextureUrl, product, selectedColor, activeViewId, onViewChange, minimal = false, className = ''
}: ProductPreviewProps) {

    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const [showGrid, setShowGrid] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);

    // Calculate percentage positioning
    const currentZone = activePreview.previewZone || product.designZone;
    const zoneStyle = {
        left: `${(currentZone.left / product.canvasSize) * 100}%`,
        top: `${(currentZone.top / product.canvasSize) * 100}%`,
        width: `${(currentZone.width / product.canvasSize) * 100}%`,
        height: `${(currentZone.height / product.canvasSize) * 100}%`,
    };

    return (
        <div className={cn("flex flex-col h-full w-full relative group", className)}>

            {/* Controls Overlay (Only on Hover/Active) */}
            {!minimal && (
                <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600"
                        title="Toggle Grid"
                    >
                        {showGrid ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            )}

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full max-w-2xl aspect-square transition-all duration-500">

                    {/* Loading Spinner */}
                    {imgLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                        </div>
                    )}

                    {/* 1. Base Image (Shirt) */}
                    <img
                        src={selectedColor.images[activeViewId] || selectedColor.images['front']}
                        alt="Product Base"
                        onLoad={() => setImgLoading(false)}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 select-none transition-opacity duration-300"
                        style={{ opacity: imgLoading ? 0 : 1 }}
                    />

                    {/* 2. Grid Overlay (Helper) */}
                    {showGrid && (
                        <div
                            className="absolute z-40 border-2 border-dashed border-indigo-400/50 bg-indigo-500/5 pointer-events-none animate-in fade-in"
                            style={zoneStyle}
                        />
                    )}

                    {/* 3. THE DESIGN (Realistic Blend) */}
                    {designTextureUrl && (
                        <div
                            className="absolute z-20 pointer-events-none"
                            style={{
                                ...zoneStyle,
                                transform: activePreview.cssTransform || 'none', // Handle 3D perspective if needed
                            }}
                        >
                            {/* Inner img applies the blend mode to look like ink on fabric */}
                            <img
                                src={designTextureUrl}
                                alt="Design"
                                className="w-full h-full object-contain"
                                style={{ mixBlendMode: 'multiply', opacity: 0.95 }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnails */}
            {!minimal && product.previews.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-lg flex gap-2 z-30">
                    {product.previews.map((preview) => (
                        <button
                            key={preview.id}
                            onClick={() => onViewChange(preview.id)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all",
                                activeViewId === preview.id ? "bg-indigo-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
