import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./components/ClientShell";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import OrganizationSchema from "./components/seo/OrganizationSchema";
import WebSiteSchema from "./components/seo/WebSiteSchema";
import SiteNavigationSchema from "./components/seo/SiteNavigationSchema";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.printbrawl.com'),
  title: {
    default: "Print Brawl - Design Your Own Custom Apparel & Gifts",
    template: "%s | Print Brawl"
  },
  description: "Express your unique style with Print Brawl. Design your own custom t-shirts, hoodies, and accessories. Perfect for personal use, gifts, and special occasions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.printbrawl.com",
    siteName: "Print Brawl",
    title: "Print Brawl - Design Your Own Custom Apparel & Gifts",
    description: "Express your unique style with Print Brawl. Design your own custom t-shirts, hoodies, and accessories.",
    images: [
      {
        url: "/logov2.png", // Using logo as fallback OG image
        width: 800,
        height: 600,
        alt: "Print Brawl - Design Your Own",
      },
    ],
  },
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Brawl - Design Your Own Custom Apparel & Gifts",
    description: "Express your unique style with Print Brawl. Design your own custom t-shirts, hoodies, and accessories.",
    images: ["/logov2.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <OrganizationSchema />
        <WebSiteSchema />
        <SiteNavigationSchema />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ClientShell>
                {children}
              </ClientShell>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
