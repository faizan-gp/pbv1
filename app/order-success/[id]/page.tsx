import Link from "next/link";
import { CheckCircle, ArrowRight, Package, MapPin, Calendar, Printer } from "lucide-react";
import PrintOrderButton from "@/app/components/PrintOrderButton";
import OrderHistoryItem from "@/app/components/OrderHistoryItem";
import PurchaseTracker from "@/app/components/analytics/PurchaseTracker";
import { getOrderById } from "@/lib/firestore/orders";
import { notFound } from "next/navigation";

async function getOrder(id: string) {
    return await getOrderById(id);
}

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        return notFound();
    }

    // Helper to fetch products (same as admin page)
    const getProductsForOrder = async (items: any[]) => {
        const { getProductById } = await import("@/lib/firestore/products");
        try {
            const productIds = Array.from(new Set(items.map((item: any) => item.productId)));
            const products = await Promise.all(productIds.map(id => getProductById(id as string)));
            const productMap: Record<string, any> = {};
            products.forEach((p) => {
                if (p) productMap[p.id] = p;
            });
            return productMap;
        } catch (e) {
            console.error(e);
            return {};
        }
    };

    const products = await getProductsForOrder(order.items);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Purchase Tracker */}
                <PurchaseTracker order={order} products={products} />

                {/* Success Header */}
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order Placed Successfully!</h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Thank you for your purchase. Your order <span className="font-mono font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span> has been confirmed.
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
                        {/* Items with Interactive Preview */}
                        <div className="space-y-6">
                            {order.items.map((item: any, idx: number) => (
                                <OrderHistoryItem
                                    key={idx}
                                    item={item}
                                    product={products[item.productId]}
                                />
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
