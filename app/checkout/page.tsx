"use client";

import { CreditCard, Truck, MapPin, ShieldCheck, Lock, Mail, User, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postalCode: ''
    });

    const shipping = 5.99;
    const total = cartTotal + shipping;

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const [isSuccess, setIsSuccess] = useState(false);

    // Redirect if cart is empty, but NOT if we just successfully completed an order
    useEffect(() => {
        if (mounted && items.length === 0 && !isSuccess) {
            router.push('/cart');
        }
    }, [mounted, items.length, isSuccess, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const createOrderRecord = async (details: any = {}) => {
        try {
            // Use form data if available, or fall back to PayPal details if needed
            // For this implementation, we rely on the form being filled out for consistent database records
            // In a production app, you might sync this with details from the PayPal object

            const shippingDetails = {
                firstName: formData.firstName || details.payer?.name?.given_name || 'Guest',
                lastName: formData.lastName || details.payer?.name?.surname || 'User',
                email: formData.email || details.payer?.email_address,
                address: formData.address || details.purchase_units?.[0]?.shipping?.address?.address_line_1,
                city: formData.city || details.purchase_units?.[0]?.shipping?.address?.admin_area_2,
                state: formData.state || details.purchase_units?.[0]?.shipping?.address?.admin_area_1,
                postalCode: formData.postalCode || details.purchase_units?.[0]?.shipping?.address?.postal_code,
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    total,
                    shippingDetails,
                    paymentMethod: 'paypal'
                }),
            });

            if (!res.ok) throw new Error('Order failed');

            const { orderId } = await res.json();
            return orderId;
        } catch (error) {
            console.error("Failed to create order record:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const shippingDetails = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    total,
                    shippingDetails,
                    paymentMethod
                }),
            });

            if (!res.ok) throw new Error('Order failed');

            const { orderId } = await res.json();
            setIsSuccess(true); // Prevent redirect to cart
            clearCart();
            router.push(`/order-success/${orderId}`);
        } catch (error) {
            console.error(error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;



    if (!mounted || items.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white pt-24 pb-24 relative overflow-hidden">

            {/* Global Background Noise */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="container-width px-4 relative z-10">

                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-slate-500 text-sm font-medium">
                    <span className="hover:text-indigo-600 cursor-pointer" onClick={() => router.push('/cart')}>Cart</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-900 font-bold flex items-center gap-2">
                        Checkout <Lock className="w-3 h-3 text-green-500" />
                    </span>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">

                    {/* --- LEFT COLUMN: FORMS --- */}
                    <div className="lg:col-span-7 space-y-8">

                        <form id="checkout-form" onSubmit={handleSubmit}>
                            {/* 1. Contact Info */}
                            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-xl border-slate-200 pl-11 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Shipping Info */}
                            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Shipping Address</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Street Address</label>
                                        <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">City</label>
                                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">State / Province</label>
                                        <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ZIP / Postal Code</label>
                                        <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                    </div>
                                </div>
                            </section>

                            {/* 3. Payment Method */}
                            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                                </div>

                                {/* Visual Toggle */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div
                                        onClick={() => setPaymentMethod('card')}
                                        className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-200'}`}
                                    >
                                        <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-indigo-900' : 'text-slate-600'}`}>Credit Card</span>
                                    </div>
                                    <div
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-200'}`}
                                    >
                                        {/* Simple PayPal Icon SVG */}
                                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.05078 20.0039H10.5132L11.238 15.3906H13.882C17.0211 15.3906 18.7844 13.868 19.1672 10.9633C19.3492 9.58281 18.8922 8.44141 17.8922 7.575C16.8922 6.70859 15.3469 6.27539 13.257 6.27539H8.72109C8.32813 6.27539 8.00313 6.57031 7.94219 6.96094L6.34688 19.0687C6.30938 19.3523 6.53203 19.6008 6.81797 19.6008H7.05078V20.0039Z" fill="#253B80" />
                                        </svg>
                                        <span className={`font-bold text-sm ${paymentMethod === 'paypal' ? 'text-blue-900' : 'text-slate-600'}`}>PayPal</span>
                                    </div>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Card Number</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="0000 0000 0000 0000"
                                                    className="block w-full rounded-xl border-slate-200 py-3 pl-4 pr-10 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expiry Date</label>
                                                <input required type="text" placeholder="MM/YY" className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CVC</label>
                                                <input required type="text" placeholder="123" className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50" />
                                            </div>
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full mt-6 rounded-2xl border border-transparent bg-slate-900 px-4 py-4 text-base font-bold text-white shadow-xl hover:bg-indigo-600 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            {isSubmitting ? "Processing Payment..." : `Pay $${total.toFixed(2)}`}
                                        </button>

                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                            <Lock className="w-3 h-3" /> Payments are secure and encrypted.
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'paypal' && (
                                    <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 text-blue-800 text-sm">
                                            <p>Use the test account provided in documentation or a sandbox account to test this flow.</p>
                                        </div>

                                        {/* PayPal Buttons Integration */}
                                        <div className="relative z-0">
                                            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                                <PayPalButtons
                                                    style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay" }}
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            intent: "CAPTURE",
                                                            purchase_units: [{
                                                                amount: {
                                                                    currency_code: "USD",
                                                                    value: total.toFixed(2),
                                                                },
                                                                description: "PrintBrawl Custom Order"
                                                            }],
                                                        });
                                                    }}
                                                    onApprove={async (data, actions) => {
                                                        if (actions.order) {
                                                            const details = await actions.order.capture();
                                                            try {
                                                                const orderId = await createOrderRecord(details);
                                                                setIsSuccess(true); // Prevent redirect to cart
                                                                clearCart();
                                                                router.push(`/order-success/${orderId}`);
                                                            } catch (err) {
                                                                alert('Error saving order');
                                                            }
                                                        }
                                                    }}
                                                />
                                            </PayPalScriptProvider>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </form>
                    </div>

                    {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
                    <div className="lg:col-span-5 mt-10 lg:mt-0">
                        <div className="sticky top-28 space-y-6">

                            {/* Receipt Card */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                                {/* Decor: Top serrated edge look */}
                                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                                <div className="p-6 md:p-8">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="h-20 w-20 flex-none bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden relative group">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={80}
                                                        height={80}
                                                        className="h-full w-full object-contain mix-blend-multiply"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">Color: {item.options.color}</p>
                                                    {item.options.customText && (
                                                        <p className="text-xs text-indigo-600 font-medium mt-0.5">Custom: "{item.options.customText}"</p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                        <p className="font-bold text-sm text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-slate-100 my-6"></div>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Shipping</span>
                                            <span>${shipping.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <span className="text-base font-bold text-slate-900">Total</span>
                                            <span className="text-2xl font-black text-indigo-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        100% Satisfaction Guarantee
                                    </p>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="flex items-center justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <Truck className="w-6 h-6 text-slate-600" />
                                <div className="text-xs text-slate-400 font-medium">Fast Shipping</div>
                                <div className="h-4 w-px bg-slate-300"></div>
                                <ShieldCheck className="w-6 h-6 text-slate-600" />
                                <div className="text-xs text-slate-400 font-medium">Quality Check</div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}