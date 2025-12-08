'use client';

import { useState } from 'react';
import { Palette, Package, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProfileDashboardProps {
    user: any;
    designs: any[];
    orders: any[];
}

export default function ProfileDashboard({ user, designs, orders }: ProfileDashboardProps) {
    const [activeTab, setActiveTab] = useState<'designs' | 'orders'>('designs');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* SIDEBAR */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full mb-4" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold mb-4">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <h2 className="font-bold text-slate-900 text-lg">{user.name}</h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('designs')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'designs' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Palette size={18} />
                            My Designs
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Package size={18} />
                            Order History
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                    {activeTab === 'designs' ? (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900">Saved Designs</h3>
                            {designs.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Palette size={32} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900">No designs yet</h4>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start creating your own custom apparel and save them here for later.</p>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                    >
                                        Start Designing
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {designs.map((design) => (
                                        <div key={design._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                                            <div className="aspect-square relative bg-slate-50 p-4">
                                                <img
                                                    src={design.previewImage}
                                                    alt={design.name}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h4 className="font-bold text-slate-900 mb-1">{design.name}</h4>
                                                <p className="text-xs text-slate-500 mb-4">
                                                    Saved on {new Date(design.createdAt).toLocaleDateString()}
                                                </p>
                                                <button className="mt-auto w-full py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-sm">
                                                    Edit Design
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900">Order History</h3>
                            {orders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package size={32} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900">No orders yet</h4>
                                    <p className="text-slate-500 mb-6">Looks like you haven't made any purchases yet.</p>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                    >
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <Link href={`/order-success/${order._id}`} key={order._id} className="block group">
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow group-hover:border-indigo-100">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-slate-900">#{order._id.toString().slice(-8).toUpperCase()}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900 text-lg">${order.total.toFixed(2)}</p>
                                                    <p className="text-xs text-slate-500">{order.items.length} items</p>
                                                </div>
                                                <div className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
