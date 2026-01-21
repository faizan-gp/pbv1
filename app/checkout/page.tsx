"use client";

import { CreditCard, Truck, MapPin, ShieldCheck, Lock, Mail, User, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";
import { trackBeginCheckout } from "@/lib/analytics";

const US_STATES = [
    { name: 'Alabama', code: 'AL' }, { name: 'Alaska', code: 'AK' }, { name: 'Arizona', code: 'AZ' }, { name: 'Arkansas', code: 'AR' }, { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' }, { name: 'Connecticut', code: 'CT' }, { name: 'Delaware', code: 'DE' }, { name: 'Florida', code: 'FL' }, { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' }, { name: 'Idaho', code: 'ID' }, { name: 'Illinois', code: 'IL' }, { name: 'Indiana', code: 'IN' }, { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' }, { name: 'Kentucky', code: 'KY' }, { name: 'Louisiana', code: 'LA' }, { name: 'Maine', code: 'ME' }, { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' }, { name: 'Michigan', code: 'MI' }, { name: 'Minnesota', code: 'MN' }, { name: 'Mississippi', code: 'MS' }, { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' }, { name: 'Nebraska', code: 'NE' }, { name: 'Nevada', code: 'NV' }, { name: 'New Hampshire', code: 'NH' }, { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' }, { name: 'New York', code: 'NY' }, { name: 'North Carolina', code: 'NC' }, { name: 'North Dakota', code: 'ND' }, { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' }, { name: 'Oregon', code: 'OR' }, { name: 'Pennsylvania', code: 'PA' }, { name: 'Rhode Island', code: 'RI' }, { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' }, { name: 'Tennessee', code: 'TN' }, { name: 'Texas', code: 'TX' }, { name: 'Utah', code: 'UT' }, { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' }, { name: 'Washington', code: 'WA' }, { name: 'West Virginia', code: 'WV' }, { name: 'Wisconsin', code: 'WI' }, { name: 'Wyoming', code: 'WY' },
    { name: 'District of Columbia', code: 'DC' }
];


export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    useEffect(() => {
        if (mounted && items.length > 0) {
            trackBeginCheckout(items, total);
        }
    }, [mounted, items.length, total]);

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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.postalCode) newErrors.postalCode = 'ZIP code is required';

        setErrors(newErrors);

        const firstErrorKey = Object.keys(newErrors)[0];
        if (firstErrorKey) {
            const element = document.getElementsByName(firstErrorKey)[0];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }

        return Object.keys(newErrors).length === 0;
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

                        <form id="checkout-form" onSubmit={(e) => e.preventDefault()}>
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
                                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
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
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 ${errors.firstName ? 'border-red-500 bg-red-50' : ''}`} />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`} />
                                        {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</p>}
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Street Address</label>
                                        <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 ${errors.address ? 'border-red-500 bg-red-50' : ''}`} />
                                        {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">City</label>
                                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 ${errors.city ? 'border-red-500 bg-red-50' : ''}`} />
                                        {errors.city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">State / Province</label>
                                        <div className="relative">
                                            <select
                                                required
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange as any}
                                                className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 appearance-none ${errors.state ? 'border-red-500 bg-red-50' : ''}`}
                                            >
                                                <option value="">Select State</option>
                                                {US_STATES.map((state) => (
                                                    <option key={state.code} value={state.code}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <ChevronRight className="h-4 w-4 rotate-90" />
                                            </div>
                                        </div>
                                        {errors.state && <p className="text-red-500 text-xs mt-1 ml-1">{errors.state}</p>}
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ZIP / Postal Code</label>
                                        <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={`block w-full rounded-xl border-slate-200 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 ${errors.postalCode ? 'border-red-500 bg-red-50' : ''}`} />
                                        {errors.postalCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.postalCode}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* 3. Payment Method */}
                            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                                </div>

                                <div className="mt-6">
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 text-blue-800 text-sm">
                                        <p>Securely pay with PayPal, PayPal Credit, or Debit/Credit Card.</p>
                                    </div>

                                    {/* PayPal Buttons Integration */}
                                    <div className="relative z-0">
                                        <PayPalScriptProvider options={{
                                            clientId: process.env.NEXT_PUBLIC_PAYPAL_ENV === 'production'
                                                ? process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID!
                                                : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "test",
                                            currency: "USD",
                                            intent: "capture",
                                            locale: "en_US" // Force US English locale
                                        }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay" }}
                                                onClick={(data, actions) => {
                                                    if (!validateForm()) {
                                                        return actions.reject();
                                                    }
                                                    return actions.resolve();
                                                }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        intent: "CAPTURE",
                                                        payer: {
                                                            name: {
                                                                given_name: formData.firstName,
                                                                surname: formData.lastName
                                                            },
                                                            email_address: formData.email,
                                                            address: {
                                                                address_line_1: formData.address,
                                                                admin_area_2: formData.city,
                                                                admin_area_1: formData.state,
                                                                postal_code: formData.postalCode,
                                                                country_code: "US"
                                                            }
                                                        },
                                                        purchase_units: [{
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: total.toFixed(2),
                                                            },
                                                            description: "PrintBrawl Custom Order",
                                                            shipping: {
                                                                name: {
                                                                    full_name: `${formData.firstName} ${formData.lastName}`
                                                                },
                                                                address: {
                                                                    address_line_1: formData.address,
                                                                    admin_area_2: formData.city,
                                                                    admin_area_1: formData.state,
                                                                    postal_code: formData.postalCode,
                                                                    country_code: "US"
                                                                }
                                                            }
                                                        }],
                                                        application_context: {
                                                            shipping_preference: 'SET_PROVIDED_ADDRESS',
                                                            locale: 'en-US',
                                                            landing_page: 'BILLING',
                                                            user_action: 'PAY_NOW'
                                                        }
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