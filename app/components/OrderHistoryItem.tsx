'use client';

import { useState } from 'react';
import ProductPreview from './ProductPreview';
import { Download } from 'lucide-react';

interface OrderHistoryItemProps {
    item: any;
    product: any;
}

export default function OrderHistoryItem({ item, product }: OrderHistoryItemProps) {
    const [activeViewId, setActiveViewId] = useState(product?.previews?.[0]?.id || 'front');

    if (!product) {
        return (
            <div className="flex gap-4 sm:gap-6 p-4 border rounded-xl bg-slate-50 items-center text-slate-500">
                <div>
                    <h3 className="font-bold text-slate-900">{item.productId}</h3>
                    <p className="text-xs">Product data not found.</p>
                </div>
            </div>
        );
    }

    // Safely find color
    const colorName = item.configSnapshot?.color || product.colors?.[0]?.name || 'Default';
    const selectedColor = product.colors?.find((c: any) => c.name === colorName) || product.colors?.[0] || { name: 'Unknown', hex: '#ccc', images: {} };

    // Determine correct design texture for the active view
    const currentDesignUrl = item.previewsSnapshot?.[activeViewId] || item.previewSnapshot;

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
            {/* Left: Preview */}
            <div className="w-full md:w-48 lg:w-64 flex-none">
                <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
                    <div className="absolute inset-0">
                        <ProductPreview
                            designTextureUrl={currentDesignUrl}
                            product={product}
                            selectedColor={selectedColor}
                            activeViewId={activeViewId}
                            onViewChange={setActiveViewId}
                            minimal={true}
                            isOverlay={true}
                        />
                    </div>
                </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            {item.configSnapshot && (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                                    Color: {item.configSnapshot.color}
                                </span>
                            )}
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                                Qty: {item.quantity}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900 text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">${item.price.toFixed(2)} / each</p>
                    </div>
                </div>

                <div className="mt-auto pt-6 flex flex-wrap gap-3">
                    {/* View Gallery Thumbnails */}
                    {item.previewsSnapshot && Object.keys(item.previewsSnapshot).length > 0 && (
                        <div className="flex gap-2">
                            {Object.entries(item.previewsSnapshot).map(([viewId, url]) => (
                                <button
                                    key={viewId}
                                    onClick={() => setActiveViewId(viewId)}
                                    className={`w-10 h-10 rounded-lg border overflow-hidden relative ${activeViewId === viewId ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    title={`View ${viewId}`}
                                >
                                    <img src={url as string} className="w-full h-full object-contain p-1" alt={viewId} />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1"></div>

                    {/* Download Button */}
                    {currentDesignUrl && (
                        <a
                            href={currentDesignUrl}
                            download={`design_${item.productId}_${activeViewId}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors"
                        >
                            <Download size={16} /> DOWNLOAD DESIGN
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
