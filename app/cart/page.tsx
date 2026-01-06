"use client";

import Link from "next/link";
import { Trash2, ArrowRight, Minus, Plus, PackageOpen, ChevronLeft, Settings2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    // Calculate total shipping (fallback to 5.99 if not set)
    const shipping = items.reduce((acc, item) => acc + ((item.shippingCost ?? 5.99) * item.quantity), 0);

    // const shipping = 5.99; // Removed hardcoded
    const total = cartTotal + shipping;
    const hasItems = items.length > 0;

    return (
        <div className="min-h-screen bg-[#F0F2F5] py-8 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">

            {/* Main Floating Container */}
            <div className="w-full max-w-6xl bg-white shadow-xl shadow-slate-200/60 rounded-[32px] overflow-hidden flex flex-col lg:flex-row min-h-[600px]">

                {/* LEFT PANEL: Cart Items */}
                <div className="flex-1 p-8 sm:p-12 lg:pr-16 relative">
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shopping Bag</h1>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {items.length} Items
                        </span>
                    </div>

                    {!hasItems ? (
                        <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                            <div className="bg-slate-50 p-6 rounded-full mb-6">
                                <PackageOpen className="h-12 w-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Your bag is empty</h3>
                            <p className="text-slate-500 mt-2 mb-8 max-w-xs mx-auto">
                                You haven't added any custom designs yet. Let's create something unique.
                            </p>
                            <Link
                                href="/products"
                                className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700"
                            >
                                Start Designing
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {items.map((item) => (
                                <div key={item.id} className="group flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Image Card */}
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain p-3 mix-blend-multiply"
                                        />
                                        {/* Design Overlay */}
                                        {item.previews && Object.values(item.previews).map((overlay, i) => (
                                            <img
                                                key={i}
                                                src={overlay}
                                                alt="Design Overlay"
                                                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-90 p-3"
                                            />
                                        ))}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 w-full pt-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                    <Link href={`/product/${item.productId}`}>{item.name}</Link>
                                                </h3>
                                                <div className="mt-2 space-y-1">
                                                    {item.options.color && (
                                                        <div className="flex items-center text-sm text-slate-500">
                                                            <span className="w-3 h-3 rounded-full bg-slate-200 mr-2"></span>
                                                            {item.options.color}
                                                        </div>
                                                    )}
                                                    {item.options.customText && (
                                                        <div className="text-sm text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded">
                                                            Text: "{item.options.customText}"
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-slate-400">
                                                        Shipping: ${(item.shippingCost ?? 5.99).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Controls Bar */}
                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition disabled:opacity-30"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-slate-700">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {item.designState && (
                                                    <Link
                                                        href={`/customize/${item.productId}?editCartId=${item.id}`}
                                                        className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wide"
                                                    >
                                                        <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                                                        Edit
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="flex items-center text-xs font-semibold text-red-500 hover:text-red-600 uppercase tracking-wide"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Back Link */}
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <Link href="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* RIGHT PANEL: Summary */}
                <div className="lg:w-[400px] bg-slate-50/80 p-8 sm:p-12 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Summary</h2>

                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-900">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Shipping</span>
                            <span className="font-medium text-slate-900">{items.length > 0 ? `$${shipping.toFixed(2)}` : '$0.00'}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Tax estimate</span>
                            <span className="text-slate-400 italic">Calculated at checkout</span>
                        </div>

                        {/* Promo Code Input Mockup */}
                        <div className="pt-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Promo Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter code"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    disabled={!hasItems}
                                />
                                <button className="px-4 py-2 bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-200">
                        <div className="flex justify-between items-end mb-8">
                            <span className="text-base font-semibold text-slate-600">Total Due</span>
                            <span className="text-3xl font-extrabold text-slate-900">${hasItems ? total.toFixed(2) : '0.00'}</span>
                        </div>

                        <Link
                            href="/checkout"
                            className={`w-full flex items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${!hasItems ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Checkout <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 16L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span>Encrypted and Secure Payment</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}