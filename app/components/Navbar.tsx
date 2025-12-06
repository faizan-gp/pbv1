"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { cartCount } = useCart();

    return (
        <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
                >
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Print</span>
                    <span className="text-gray-900">Brawl</span>
                </Link>

                <div className="flex items-center gap-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        Products
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 py-2">
                            Categories
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full left-0 pt-2 w-48 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200">
                            <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden py-1">
                                {[
                                    "Men's Clothing",
                                    "Women's Clothing",
                                    "Kids' Clothing",
                                    "Accessories",
                                    "Home & Living"
                                ].map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/products?category=${encodeURIComponent(cat)}`}
                                        className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/about"
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        About
                    </Link>
                    <Link
                        href="/faq"
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        FAQ
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        Contact
                    </Link>
                    <Link
                        href="/cart"
                        className="group relative flex items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                        {cartCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}
