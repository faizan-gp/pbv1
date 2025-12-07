import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { Package } from 'lucide-react';

async function getOrders() {
    await dbConnect();
    // Populate user details for the email
    const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        View and manage customer orders.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Order ID</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Customer</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Total</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order._id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                                        #{order._id.toString().slice(-8).toUpperCase()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        <div className="font-medium text-slate-900">{order.shippingDetails?.name || 'Guest'}</div>
                                        <div className="text-xs text-slate-500">{order.shippingDetails?.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-slate-900">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.status === 'delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
