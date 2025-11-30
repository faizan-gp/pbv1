import React from 'react';
import { Product } from '../data/products';

interface ProductPreviewProps {
    designTextureUrl: string | null;
    product: Product;
}

export default function ProductPreview({ designTextureUrl, product }: ProductPreviewProps) {
    // Standard maps (defaults if not specified in product)
    const DISTORTION_MAP_URL = product.previewConfig.displacementMap || '/shirt_base_normal_map.png';
    const SHADOW_MAP_URL = product.previewConfig.shadowMap || '/shirt_base_ambient_occ.png';
    const HIGHLIGHT_MAP_URL = product.previewConfig.displacementMap || '/shirt_base_displacement.png';

    // State to toggle print area visibility
    const [showPrintArea, setShowPrintArea] = React.useState(true);

    // Calculate percentages for CSS positioning
    // We convert raw pixels (e.g., 280) into percentages relative to canvasSize (e.g., 1000)
    // NOTE: We use previewConfig.designZone here, not the editor's designZone
    const zoneStyle = {
        left: `${(product.previewConfig.designZone.left / product.canvasSize) * 100}%`,
        top: `${(product.previewConfig.designZone.top / product.canvasSize) * 100}%`,
        width: `${(product.previewConfig.designZone.width / product.canvasSize) * 100}%`,
        height: `${(product.previewConfig.designZone.height / product.canvasSize) * 100}%`,
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

            <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-inner group select-none">

                {/* LAYER 1: Base Product Image */}
                <img
                    src={product.previewConfig.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                />

                {/* --- NEW LAYER: The Print Area Guide --- 
                    We place this UNDER the design (z-15) or blended with it.
                    We apply the 'fabric-warp' filter so the border curves with the shirt.
                */}
                {showPrintArea && (
                    <div
                        className="absolute z-15 border-2 border-dashed border-blue-400/60 pointer-events-none"
                        style={{
                            ...zoneStyle,
                            // This makes the straight border wiggle with the shirt folds!
                            filter: 'url(#fabric-warp)',
                            // Optional: blend mode to make it look like it's printed on
                            mixBlendMode: 'multiply'
                        }}
                    >
                        {/* Optional: Add a label inside the box */}
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
                            ...zoneStyle, // Position it exactly in the preview zone
                            mixBlendMode: 'normal',
                            opacity: 1,
                            filter: 'url(#fabric-warp) contrast(1)',
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
                {/* ... legend items ... */}
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full border border-blue-400 border-dashed"></div>
                    <span>Print Zone</span>
                </div>
            </div>
        </div>
    );
}