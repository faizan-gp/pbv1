import React, { useEffect } from 'react';
import { Product, ProductColor } from '../data/products';

interface ProductPreviewProps {
    designTextureUrl: string | null;
    product: Product;
    selectedColor: ProductColor;
    activeViewId: string;
    onViewChange: (id: string) => void;
}

export default function ProductPreview({ designTextureUrl, product, selectedColor, activeViewId, onViewChange }: ProductPreviewProps) {
    // Get current preview config
    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];

    // Standard maps
    const DISTORTION_MAP_URL = activePreview.displacementMap || '/products/shirt/maps/shirt_base_normal_map.png';
    const SHADOW_MAP_URL = activePreview.shadowMap || '/products/shirt/maps/shirt_base_ambient_occ.png';
    const HIGHLIGHT_MAP_URL = activePreview.displacementMap || '/products/shirt/maps/shirt_base_displacement.png';

    // State to toggle print area visibility
    const [showPrintArea, setShowPrintArea] = React.useState(true);
    const [enableDistortion, setEnableDistortion] = React.useState(true);

    useEffect(() => {
        // Check if device is iOS (iPhone, iPad, iPod)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
            setEnableDistortion(false);
        }
    }, []);

    // Calculate percentages for CSS positioning
    const currentZone = activePreview.previewZone || product.designZone; // Fallback for safety
    const zoneStyle = {
        left: `${(currentZone.left / product.canvasSize) * 100}%`,
        top: `${(currentZone.top / product.canvasSize) * 100}%`,
        width: `${(currentZone.width / product.canvasSize) * 100}%`,
        height: `${(currentZone.height / product.canvasSize) * 100}%`,
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 h-full">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Product Preview</h3>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setShowPrintArea(!showPrintArea)}
                        className={`p-1.5 rounded-lg transition-colors ${showPrintArea ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                        title={showPrintArea ? "Hide Print Area" : "Show Print Area"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        High Fidelity
                    </span>
                </div>
            </div>

            {/* View Switcher Tabs */}
            {product.previews.length > 1 && (
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                    {product.previews.map((preview) => (
                        <button
                            key={preview.id}
                            onClick={() => onViewChange(preview.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeViewId === preview.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {preview.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-inner group select-none">

                {/* LAYER 1: Base Product Image */}
                <img
                    src={selectedColor.images[activeViewId] || selectedColor.images[product.previews[0].id]}
                    alt={`${product.name} - ${activePreview.name}`}
                    className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                />

                {/* --- NEW LAYER: The Print Area Guide --- */}
                {showPrintArea && (
                    <div
                        className="absolute z-15 border-2 border-dashed border-blue-400/60 pointer-events-none"
                        style={{
                            ...zoneStyle,
                            filter: enableDistortion ? 'url(#fabric-warp)' : 'none',
                            mixBlendMode: 'multiply'
                        }}
                    >
                        <span className="absolute -top-6 left-0 text-[10px] text-blue-400 font-mono uppercase tracking-widest opacity-70">
                            Print Area
                        </span>
                    </div>
                )}

                {/* LAYER 2: The Design (Distorted & Blended) */}
                {designTextureUrl && (
                    <img
                        src={designTextureUrl}
                        alt="Design"
                        className="absolute z-20 pointer-events-none transition-all duration-200"
                        style={{
                            ...zoneStyle,
                            mixBlendMode: 'normal',
                            opacity: 1,
                            filter: enableDistortion ? 'url(#fabric-warp) contrast(1)' : 'contrast(1)',
                            imageRendering: 'auto',
                        }}
                    />
                )}

                {/* LAYER 3: Highlights */}
                <img
                    src={HIGHLIGHT_MAP_URL}
                    alt="Fabric Highlights"
                    className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none"
                    style={{
                        mixBlendMode: 'soft-light',
                        opacity: 0.5,
                    }}
                />

                {/* LAYER 4: Deep Shadows */}
                <img
                    src={SHADOW_MAP_URL}
                    alt="Fabric Shadows"
                    className="absolute inset-0 w-full h-full object-contain z-40 pointer-events-none"
                    style={{
                        mixBlendMode: 'multiply',
                        opacity: 0.6
                    }}
                />

                {/* SVG FILTER DEFINITION */}
                <svg className="absolute w-0 h-0">
                    <defs>
                        <filter id="fabric-warp">
                            <feImage
                                href={DISTORTION_MAP_URL}
                                result="map"
                                x="0" y="0" width="100%" height="100%"
                                preserveAspectRatio="none"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="map"
                                scale="5"
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </defs>
                </svg>

            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full border border-blue-400 border-dashed"></div>
                    <span>Print Zone</span>
                </div>
            </div>
        </div>
    );
}