"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { cartCount } = useCart();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
                >
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Print</span>
                    <span className="text-white">Brawl</span>
                </Link>

                <div className="flex items-center gap-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                        Products
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                        About
                    </Link>
                    <Link
                        href="/faq"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                        FAQ
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                        Contact
                    </Link>
                    <Link
                        href="/cart"
                        className="group relative flex items-center justify-center rounded-full p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                        {cartCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-black">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
