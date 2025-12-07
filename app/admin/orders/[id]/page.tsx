import Link from "next/link";
import { ArrowLeft, Package, MapPin, Calendar, Mail, User } from "lucide-react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { notFound } from "next/navigation";
import OrderStatusUpdater from "@/app/components/OrderStatusUpdater";

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

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                    <p className="text-sm text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <OrderStatusUpdater orderId={order._id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-500" /> Items
                        </h2>
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
                    </div>
                </div>

                {/* Sidebar: Customer & Summary */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" /> Customer
                        </h2>
                        <div className="space-y-4 text-sm text-slate-600">
                            <div>
                                <h3 className="font-bold text-slate-900">Contact</h3>
                                <p className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {order.shippingDetails?.email}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2">Shipping Address</h3>
                                <div className="space-y-1">
                                    <p className="font-medium text-slate-900">{order.shippingDetails?.name}</p>
                                    <p>{order.shippingDetails?.address}</p>
                                    <p>{order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.postalCode}</p>
                                    <p>{order.shippingDetails?.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary</h2>
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
        </div>
    );
}
