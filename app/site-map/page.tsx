import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap | Print Brawl",
    description: "Overview of all pages on Print Brawl.",
};

export default function SitemapPage() {
    const sections = [
        {
            title: "Shop",
            links: [
                { name: "All Products", href: "/products" },
                { name: "Men's Clothing", href: "/products?category=Men's+Clothing" },
                { name: "Women's Clothing", href: "/products?category=Women's+Clothing" },
                { name: "Kids' Clothing", href: "/products?category=Kids'+Clothing" },
                { name: "Home & Living", href: "/products?category=Home+&+Living" },
                { name: "Accessories", href: "/products?category=Accessories" },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Meet the Team", href: "/team" },
                { name: "Contact", href: "/contact" },
                { name: "FAQ", href: "/faq" },
                { name: "Sitemap", href: "/site-map" },
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/terms-of-service" },
                { name: "DMCA Policy", href: "/dmca" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container-width max-w-4xl px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Sitemap</h1>
                    <p className="text-slate-600">Overview of our website structure.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section) => (
                        <div key={section.title} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                                {section.title}
                            </h2>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors block py-1"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
