"use client";

import { useState } from 'react';
import { Download, Box, AlertCircle } from 'lucide-react';
import ProductPreview from './ProductPreview';

interface AdminOrderItemsProps {
    items: any[];
    products: Record<string, any>; // Map of productId to Product data
    orderId: string;
}

function AdminOrderItem({ item, product, orderId }: { item: any, product: any, orderId: string }) {
    const [activeViewId, setActiveViewId] = useState(product?.previews?.[0]?.id || 'front');

    if (!product) {
        return (
            <div className="flex gap-4 sm:gap-6 p-4 border rounded-xl bg-slate-50 items-center text-slate-500">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                    <h3 className="font-bold text-slate-900">{item.productId}</h3>
                    <p className="text-xs">Product data not found in catalog.</p>
                </div>
            </div>
        );
    }

    // Find selected color object safely
    const colorName = item.configSnapshot?.color || product.colors?.[0]?.name || 'Default';
    const selectedColor = product.colors?.find((c: any) => c.name === colorName) || product.colors?.[0] || { name: 'Unknown', hex: '#ccc', images: {} };

    return (
        <div className="flex flex-col xl:flex-row gap-8 p-6 border border-slate-100 rounded-2xl bg-slate-50/30">
            {/* Visual Preview */}
            <div className="w-full xl:w-[400px] flex-none bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-[400px]">
                    <ProductPreview
                        designTextureUrl={item.previewsSnapshot?.[activeViewId] || item.previewSnapshot}
                        product={product}
                        selectedColor={selectedColor}
                        activeViewId={activeViewId}
                        onViewChange={setActiveViewId}
                    />
                </div>
            </div>

            {/* Details & Actions */}
            <div className="flex-1 flex flex-col py-2">
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">ID: {item.productId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Selected Color</span>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: selectedColor.hex }}></span>
                                <span className="font-medium text-slate-900">{selectedColor.name}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Quantity</span>
                            <span className="font-medium text-slate-900 text-lg">{item.quantity}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                    {/* Previews Gallery */}
                    {item.previewsSnapshot && Object.keys(item.previewsSnapshot).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {Object.entries(item.previewsSnapshot).map(([viewId, url]) => (
                                <div key={viewId} className="space-y-2">
                                    <div className="aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden relative group">
                                        <img src={url as string} alt={viewId} className="w-full h-full object-contain p-2" />
                                        <a
                                            href={url as string}
                                            target="_blank"
                                            download={`design_${viewId}.png`}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                    <p className="text-xs text-center font-bold text-slate-500 uppercase">{viewId}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Total Price</span>
                            <span className="text-3xl font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        {item.previewSnapshot ? (
                            <a
                                href={item.previewSnapshot}
                                download={`design_${orderId}_${item.productId}.png`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 group"
                            >
                                <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                                <span>Download Primary Design</span>
                            </a>
                        ) : (
                            <button disabled className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                                <Box size={20} />
                                No Design File
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminOrderItems({ items, products, orderId }: AdminOrderItemsProps) {
    return (
        <div className="space-y-6">
            {items.map((item, idx) => (
                <AdminOrderItem key={idx} item={item} product={products[item.productId]} orderId={orderId} />
            ))}
        </div>
    );
}
