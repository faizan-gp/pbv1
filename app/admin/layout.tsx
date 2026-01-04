import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Package, Settings, LogOut, MessageSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-10 flex flex-col">
                <div className="p-6">
                    <div className="text-2xl font-bold tracking-tight">
                        Print<span className="text-indigo-400">Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ShoppingBag size={20} />
                        Orders
                    </Link>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Package size={20} />
                        Products
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Users size={20} />
                        Users
                    </Link>
                    <Link
                        href="/admin/messages"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <MessageSquare size={20} />
                        Messages
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <LogOut size={20} />
                        Exit Admin
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
