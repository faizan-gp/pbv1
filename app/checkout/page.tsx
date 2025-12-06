"use client";

import { CreditCard } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

    const shipping = 5.99;
    const total = cartTotal + shipping;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        clearCart();
        router.push("/order-success");
    };

    if (items.length === 0) {
        // If user accesses checkout directly with empty cart
        if (typeof window !== 'undefined') {
            router.push('/cart');
        }
        return null;
    }

    return (
        <div className="container-width py-12">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                {/* Checkout Form */}
                <div className="lg:col-span-7">
                    <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-12">

                            {/* Contact Info */}
                            <div className="border-b border-gray-900/10 pb-12 dark:border-gray-100/10">
                                <h2 className="text-base font-semibold leading-7 text-foreground">Contact Information</h2>
                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                                            Email address
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                id="email"
                                                autoComplete="email"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border-b border-gray-900/10 pb-12 dark:border-gray-100/10">
                                <h2 className="text-base font-semibold leading-7 text-foreground">Shipping Information</h2>
                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-foreground">
                                            First name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="first-name"
                                                id="first-name"
                                                autoComplete="given-name"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-foreground">
                                            Last name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="last-name"
                                                id="last-name"
                                                autoComplete="family-name"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-foreground">
                                            Street address
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="street-address"
                                                id="street-address"
                                                autoComplete="street-address"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 sm:col-start-1">
                                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-foreground">
                                            City
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="city"
                                                id="city"
                                                autoComplete="address-level2"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="region" className="block text-sm font-medium leading-6 text-foreground">
                                            State / Province
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="region"
                                                id="region"
                                                autoComplete="address-level1"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-foreground">
                                            ZIP / Postal code
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                required
                                                type="text"
                                                name="postal-code"
                                                id="postal-code"
                                                autoComplete="postal-code"
                                                className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="border-b border-gray-900/10 pb-12 dark:border-gray-100/10">
                                <h2 className="text-base font-semibold leading-7 text-foreground">Payment</h2>
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-x-3">
                                        <input
                                            id="card"
                                            name="payment-method"
                                            type="radio"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="card" className="block text-sm font-medium leading-6 text-foreground flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Credit Card
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <input
                                            id="paypal"
                                            name="payment-method"
                                            type="radio"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={() => setPaymentMethod('paypal')}
                                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="paypal" className="block text-sm font-medium leading-6 text-foreground flex items-center gap-2">
                                            {/* Simple text label or icon could go here */}
                                            PayPal
                                        </label>
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pl-7">
                                            <div className="col-span-full">
                                                <label htmlFor="card-number" className="block text-sm font-medium leading-6 text-foreground">
                                                    Card number
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        required
                                                        type="text"
                                                        name="card-number"
                                                        id="card-number"
                                                        autoComplete="cc-number"
                                                        placeholder="0000 0000 0000 0000"
                                                        className="block w-full rounded-md border-0 py-1.5 bg-transparent text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:ring-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'paypal' && (
                                        <div className="mt-4 pl-7">
                                            <PayPalScriptProvider options={{ clientId: "test", components: "buttons" }}>
                                                <PayPalButtons
                                                    style={{ layout: "vertical" }}
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            intent: "CAPTURE",
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        currency_code: "USD",
                                                                        value: total.toFixed(2),
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={async (data, actions) => {
                                                        if (actions.order) {
                                                            await actions.order.capture();
                                                            clearCart();
                                                            router.push("/order-success");
                                                        }
                                                    }}
                                                />
                                            </PayPalScriptProvider>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-10">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full rounded-md border border-transparent bg-primary px-4 py-3 text-base font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Processing..." : "Place Order"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Order Summary (Sidebar) */}
                <div className="lg:col-span-5 mt-10 lg:mt-0">
                    <div className="rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:p-8 dark:bg-muted/20 sticky top-24">
                        <h2 className="text-lg font-medium text-foreground">Order Summary</h2>
                        <div className="mt-6 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-muted rounded-md border border-border overflow-hidden">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground w-32 truncate">
                                                {item.options.color} {item.options.customText ? `| "${item.options.customText}"` : ''}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}

                            <div className="pt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-base font-medium pt-2 border-t border-border">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
