'use client';

import React, { useState, useEffect } from 'react';
import { getAbandonedCarts, CartData } from '@/lib/firestore/carts';
import { RefreshCw, ShoppingCart, User, AlertCircle, Eye, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminCartsPage() {
    const [carts, setCarts] = useState<CartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCart, setSelectedCart] = useState<CartData | null>(null);

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const data = await getAbandonedCarts();
            setCarts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, []);

    // Helper to format date
    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Abandoned Carts</h1>
                    <p className="text-slate-500 mt-1">View active carts that haven't checked out yet.</p>
                </div>
                <button
                    onClick={fetchCarts}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    title="Refresh"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin text-slate-400" : "text-slate-600"} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            ) : carts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <ShoppingCart size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No active carts found</h3>
                    <p className="text-slate-500">Wait for users to start shopping.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {carts.map((cart) => (
                                <tr key={cart.userId} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                                <User size={18} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{cart.userEmail || 'Unknown Email'}</div>
                                                <div className="text-xs text-slate-500">ID: {cart.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900 font-medium">
                                            {cart.items.length} Items
                                        </div>
                                        <div className="text-xs text-slate-500">{cart.items.map(i => i.name).join(', ')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-indigo-600">${cart.total.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(cart.updatedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedCart(cart)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 ml-auto"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cart Details Modal */}
            {selectedCart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedCart(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Cart Details</h2>
                            <button onClick={() => setSelectedCart(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="mb-6 flex items-center gap-4 text-sm text-slate-600">
                                <span className='bg-white px-3 py-1 rounded-lg border border-slate-200 font-medium'>{selectedCart.userEmail}</span>
                                <span>Total: <b>${selectedCart.total.toFixed(2)}</b></span>
                                <span>Updated: {formatDate(selectedCart.updatedAt)}</span>
                            </div>

                            <div className="space-y-4">
                                {selectedCart.items.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-6">
                                        {/* Preview Image */}
                                        <div className="w-32 h-32 bg-slate-50 rounded-lg border border-slate-100 relative shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                                            {item.previews && Object.values(item.previews).map((p, i) => (
                                                <img key={i} src={p} className="absolute inset-0 w-full h-full object-contain p-2 opacity-90" />
                                            ))}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 mb-1">{item.name}</h4>
                                                    <div className="text-xs text-slate-500 mb-3 space-y-1">
                                                        <div>Color: {item.options.color}</div>
                                                        <div>Size: {item.options.size}</div>
                                                        <div>Quantity: {item.quantity}</div>
                                                    </div>
                                                </div>
                                                {item.designState ? (
                                                    <a
                                                        href={`/customize/${item.productId}?editCartId=${item.id}&cartUserId=${selectedCart.userId}&viewOnly=true`}
                                                        target="_blank"
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                                    >
                                                        <Eye size={14} /> Open in Configurator
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No design data</span>
                                                )}
                                            </div>

                                            {/* Design Assets Section */}
                                            {item.previews && Object.keys(item.previews).length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Design Assets</h5>
                                                    <div className="flex flex-wrap gap-3">
                                                        {Object.entries(item.previews).map(([viewId, url], i) => (
                                                            <div key={i} className="flex flex-col items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase">{viewId}</span>
                                                                <div className="relative w-16 h-16 bg-white rounded border border-slate-200">
                                                                    <img src={url} className="w-full h-full object-contain p-1" />
                                                                </div>
                                                                <a
                                                                    href={url}
                                                                    download={`${item.name}-${viewId}-design.png`}
                                                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    Download PNG
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
