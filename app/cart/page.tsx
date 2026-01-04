"use client";

import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const { items, removeFromCart, cartTotal } = useCart();

    const shipping = 5.99;
    const total = cartTotal + shipping;

    return (
        <div className="container-width py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-8">
                    {items.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-muted/10 rounded-lg">
                            <p className="text-muted-foreground">Your cart is empty.</p>
                            <Link href="/products" className="mt-4 text-primary hover:underline inline-block">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            {items.map((item) => (
                                <div key={item.id} className="flex py-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-muted dark:border-gray-700 relative">
                                        {/* Base Product Image */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                        />

                                        {/* Design Overlay (Result of CSS Composition) */}
                                        {item.previews && Object.values(item.previews).map((overlay, i) => (
                                            <img
                                                key={i}
                                                src={overlay}
                                                alt="Design Overlay"
                                                className="absolute inset-0 h-full w-full object-contain pointer-events-none mix-blend-multiply opacity-90"
                                            />
                                        ))}
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-foreground">
                                                <h3>{item.name}</h3>
                                                <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.options.color && `Color: ${item.options.color}`}
                                                {item.options.customText && `, Text: "${item.options.customText}"`}
                                            </p>
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <p className="text-muted-foreground">Qty {item.quantity}</p>

                                            <div className="flex items-center gap-4">
                                                {item.designState && (
                                                    <Link
                                                        href={`/customize/${item.productId}?editCartId=${item.id}`}
                                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                                    >
                                                        Edit Design
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-4 lg:mt-0 lg:p-8 dark:bg-muted/20">
                    <h2 className="text-lg font-medium text-foreground">Order summary</h2>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Subtotal</p>
                            <p className="text-sm font-medium text-foreground">${cartTotal.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Shipping</p>
                            <p className="text-sm font-medium text-foreground">${items.length > 0 ? shipping.toFixed(2) : '0.00'}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                            <p className="text-base font-medium text-foreground">Total</p>
                            <p className="text-base font-medium text-foreground">${items.length > 0 ? total.toFixed(2) : '0.00'}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/checkout"
                            className={`flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${items.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <div className="mt-4 text-center">
                            <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
