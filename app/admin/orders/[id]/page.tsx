import { Product } from "@/lib/firestore/products";
// Actually AdminOrderItems likely uses any or assumes structure, let's fix imports first
import AdminOrderItems from "@/app/components/AdminOrderItems";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Calendar, Mail, User } from "lucide-react";
import { getOrderById, updateOrder } from "@/lib/firestore/orders";
import { getProductById } from "@/lib/firestore/products";
import { notFound } from "next/navigation";
import OrderStatusUpdater from "@/app/components/OrderStatusUpdater";

async function getOrder(id: string) {
    return await getOrderById(id);
}

async function getProductsForOrder(items: any[]) {
    try {
        const productIds = Array.from(new Set(items.map(item => item.productId)));
        // Fetch in parallel
        const products = await Promise.all(
            productIds.map(id => getProductById(id))
        );

        const productMap: Record<string, any> = {};
        products.forEach((p) => {
            if (p) {
                productMap[p.id] = p;
            }
        });
        return productMap;
    } catch (e) {
        console.error(e);
        return {};
    }
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        return notFound();
    }

    const products = await getProductsForOrder(order.items);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-sm text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Main Content: Items */}
                <div className="space-y-6">
                    <AdminOrderItems items={order.items} products={products} orderId={order.id} />
                </div>

                {/* Customer & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
