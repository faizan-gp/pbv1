import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { CreditCard, ShoppingBag, Users as UsersIcon, TrendingUp } from 'lucide-react';

async function getStats() {
    await dbConnect();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();

    // Calculate Revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

    return {
        userCount,
        orderCount,
        productCount,
        totalRevenue
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    const statCards = [
        { name: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Total Orders', value: stats.orderCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Total Users', value: stats.userCount, icon: UsersIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'Products', value: stats.productCount, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-2">Overview of your store's performance.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section could go here */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    {/* Placeholder for quick actions if needed */}
                    <span className="text-sm text-slate-500 italic">No quick actions configured yet.</span>
                </div>
            </div>
        </div>
    );
}
