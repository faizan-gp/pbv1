import Link from "next/link";
import { CheckCircle, ArrowRight, Package, MapPin, Calendar, Printer } from "lucide-react";
import PrintOrderButton from "@/app/components/PrintOrderButton";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { notFound } from "next/navigation";

async function getOrder(id: string) {
    try {
        await dbConnect();
        const order = await Order.findById(id).lean();
        if (!order) return null;
        return JSON.parse(JSON.stringify(order));
    } catch (e) {
        return null;
    }
}

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Success Header */}
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order Placed Successfully!</h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Thank you for your purchase. Your order <span className="font-mono font-bold text-slate-900">#{order._id.slice(-8).toUpperCase()}</span> has been confirmed.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            href="/profile"
                            className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
                        >
                            View Order History
                        </Link>
                        <Link
                            href="/products"
                            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors flex items-center gap-2"
                        >
                            Continue Shopping <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-500" />
                            Order Details
                        </h2>
                        <span className="text-sm text-slate-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">

                        {/* Items */}
                        <div className="space-y-6">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 sm:gap-6">
                                    <div className="h-24 w-24 flex-none rounded-xl border border-slate-100 bg-slate-50 p-2 relative group overflow-hidden">
                                        <img
                                            src={item.previewSnapshot || '/placeholder.png'}
                                            alt="Product"
                                            className="h-full w-full object-contain mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{item.productId}</h3>
                                        {/* Ideally we'd fetch product name, but productId contains the slug usually, e.g. t-shirt-standard */}

                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {item.configSnapshot && (
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                    Color: {item.configSnapshot.color}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-slate-100"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Shipping Info */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Shipping Address
                                </h3>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-medium text-slate-900">{order.shippingDetails.name}</p>
                                    <p>{order.shippingDetails.address}</p>
                                    <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}</p>
                                    <p>{order.shippingDetails.country}</p>
                                    <p className="mt-2 text-slate-400">{order.shippingDetails.email}</p>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${(order.total - 5.99).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Shipping</span>
                                        <span>$5.99</span>
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                                        <span className="font-bold text-slate-900">Total</span>
                                        <span className="font-bold text-xl text-indigo-600">${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Action Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-center">
                        <PrintOrderButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
