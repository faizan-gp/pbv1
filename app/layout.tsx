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

export const metadata: Metadata = {
  metadataBase: new URL('https://www.printbrawl.com'),
  title: {
    default: "Print Brawl - Custom Apparel Design & Print on Demand",
    template: "%s | Print Brawl"
  },
  description: "Create custom t-shirts, hoodies, and apparel with Print Brawl's online design studio. Print-on-demand with no minimums, premium quality, and fast shipping worldwide.",
  keywords: ["custom t-shirts", "print on demand", "custom apparel", "t-shirt design", "custom hoodies", "DTG printing"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.printbrawl.com",
    siteName: "Print Brawl",
    title: "Print Brawl - Custom Apparel Design & Print on Demand",
    description: "Create custom t-shirts, hoodies, and apparel with Print Brawl's online design studio.",
    images: [
      {
        url: "/logov2.png", // Using logo as fallback OG image
        width: 800,
        height: 600,
        alt: "Print Brawl",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Brawl - Custom Apparel Design & Print on Demand",
    description: "Create custom t-shirts, hoodies, and apparel with Print Brawl's online design studio.",
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
