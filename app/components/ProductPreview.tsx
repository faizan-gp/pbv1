'use client';

import React from 'react';

interface ProductPreviewProps {
    designTextureUrl: string | null;
}

export default function ProductPreview({ designTextureUrl }: ProductPreviewProps) {
    // 1. DISTORTION SOURCE (Use Normal Map if available, otherwise Displacement)
    // Normal maps are better for warping because they separate X and Y movement.
    const DISTORTION_MAP_URL = '/shirt_base_normal_map.png';

    // 2. SHADOW SOURCE (Ambient Occlusion)
    // Darkens the deep creases.
    const SHADOW_MAP_URL = '/shirt_base_ambient_occ.png';

    // 3. HIGHLIGHT SOURCE (Displacement / Height Map)
    // Lighter areas = higher fabric. We use this to add "shine" to the wrinkles.
    const HIGHLIGHT_MAP_URL = '/shirt_base_displacement.png';

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 h-full">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Product Preview</h3>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        High Fidelity
                    </span>
                </div>
            </div>

            <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-inner group select-none">

                {/* LAYER 1: Base Product Image */}
                <img
                    src="/shirt_base.png"
                    alt="T-Shirt Base"
                    className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                />

                {/* LAYER 2: The Design (Distorted & Blended) */}
                {designTextureUrl && (
                    <img
                        src={designTextureUrl}
                        alt="Design"
                        className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none transition-all duration-200"
                        style={{
                            mixBlendMode: 'multiply',
                            opacity: 0.95,
                            // Add contrast(1.2) to pop the colors and sharpen edges visually
                            filter: 'url(#fabric-warp) contrast(1.03)',
                            imageRendering: 'auto',
                        }}
                    />
                )}

                {/* LAYER 3: Highlights (Displacement Map) 
                    Uses 'soft-light' or 'screen' to make the raised fabric folds catch light.
                    This prevents the design from looking "flat".
                */}
                <img
                    src={HIGHLIGHT_MAP_URL}
                    alt="Fabric Highlights"
                    className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none"
                    style={{
                        mixBlendMode: 'soft-light', // blends white peaks into the design
                        opacity: 0.5, // Subtle sheen
                    }}
                />

                {/* LAYER 4: Deep Shadows (AO Map)
                    Uses 'multiply' to deepen the darkest cracks on top of everything.
                */}
                <img
                    src={SHADOW_MAP_URL}
                    alt="Fabric Shadows"
                    className="absolute inset-0 w-full h-full object-contain z-40 pointer-events-none"
                    style={{
                        mixBlendMode: 'multiply',
                        opacity: 0.6
                    }}
                />

                {/* SVG FILTER DEFINITION (Hidden) */}
                <svg className="absolute w-0 h-0">
                    <defs>
                        <filter id="fabric-warp">
                            <feImage
                                href={DISTORTION_MAP_URL}
                                result="map"
                                x="0" y="0" width="100%" height="100%"
                                preserveAspectRatio="none"
                            />
                            {/* scale: Intensity of the wiggle (20-30 is usually good)
                                xChannelSelector="R": Red channel drives Horizontal shift
                                yChannelSelector="G": Green channel drives Vertical shift
                            */}
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="map"
                                scale="5"  // <--- Try reducing this. 
                                // If it was 30 or 20, try 10 or 15.
                                // Lower scale = Less distortion but sharper image.
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </defs>
                </svg>

            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Warp</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                    <span>Shadow</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>
                    <span>Highlight</span>
                </div>
            </div>
        </div>
    );
}