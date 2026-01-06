"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
    ShoppingBag,
    Menu,
    X,
    ChevronDown,
    Shirt,
    Scissors,
    Baby,
    Home,
    Watch,
    Zap
} from "lucide-react";
import { useCart } from "../context/CartContext";
import UserMenu from "./UserMenu";

export default function Navbar() {
    const { cartCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);


    // Categories Data for Mega Menu
    // Categories Data for Mega Menu
    const categories = [
        { name: "Men's Clothing", href: "/products?category=Men's+Clothing", icon: Shirt, desc: "T-Shirts, Hoodies & Tanks" },
        { name: "Women's Clothing", href: "/products?category=Women's+Clothing", icon: Scissors, desc: "Dresses, Tops & Activewear" },
        { name: "Kids' Clothing", href: "/products?category=Kids'+Clothing", icon: Baby, desc: "Onesies & Youth Tees" },
        { name: "Home & Living", href: "/products?category=Home+&+Living", icon: Home, desc: "Posters, Mugs & Pillows" },
        { name: "Accessories", href: "/products?category=Accessories", icon: Watch, desc: "Hats, Phone Cases & Bags" },
    ];

    return (
        <>
            {/* NAVBAR CONTAINER 
        - Dynamic positioning based on scroll state
      */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/50 bg-white/90 backdrop-blur-xl shadow-sm py-4"
            >
                <div className="px-4 md:px-8 flex items-center justify-between gap-4">

                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-1 group z-50 shrink-0">
                        <img
                            src="/logov2.png"
                            alt="PrintBrawl"
                            className="h-8 md:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity max-w-[140px] md:max-w-none"
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            All Products
                        </Link>

                        {/* Mega Menu Dropdown */}
                        <div className="group relative">
                            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors py-2">
                                Categories
                                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180 text-slate-400" />
                            </button>

                            {/* Invisible bridge to prevent menu closing */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 h-4 w-full"></div>

                            {/* Dropdown Content */}
                            <div className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[600px] p-2 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 ease-out perspective-[1000px]">
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-indigo-900/10 p-4 grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.name}
                                            href={cat.href}
                                            className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                                <cat.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{cat.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{cat.desc}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            How it Works
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            About Us
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* ACTIONS (Cart & Mobile Toggle) */}
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">

                        {/* Start Designing CTA (Desktop) */}
                        <Link
                            href="/products"
                            className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                        >
                            Start Designing
                        </Link>

                        {/* Cart Icon */}
                        <Link
                            href="/cart"
                            className="relative group p-2 rounded-full hover:bg-slate-100 transition-colors"
                            aria-label="View shopping cart"
                        >
                            <ShoppingBag className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white transform scale-100 transition-transform group-hover:scale-110">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile */}
                        <UserMenu />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU OVERLAY 
        - Full screen drawer style
      */}
            <div
                className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 lg:hidden flex flex-col pt-32 px-8
        ${mobileMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"}`}
            >
                <div className="flex flex-col gap-6 text-center">
                    <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-2xl font-bold text-slate-900 hover:text-indigo-600"
                    >
                        Start Designing
                    </Link>

                    <div className="border-t border-slate-100 my-2"></div>

                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Categories</span>
                        {categories.slice(0, 4).map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-medium text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2"
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link href="/products" className="text-indigo-600 font-bold text-sm mt-2">View All Categories &rarr;</Link>
                    </div>

                    <div className="border-t border-slate-100 my-2"></div>

                    <div className="flex flex-col gap-4 text-sm text-slate-500">
                        <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}>Track Order</Link>
                        <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                        <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>Help Center</Link>
                    </div>
                </div>
            </div>
        </>
    );
}