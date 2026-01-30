import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./components/ClientShell";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./components/Providers";
import { AnalyticsProvider } from "./components/analytics/AnalyticsProvider";

import PinterestTag from "./components/analytics/PinterestTag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import OrganizationSchema from "./components/seo/OrganizationSchema";
import WebSiteSchema from "./components/seo/WebSiteSchema";
import SiteNavigationSchema from "./components/seo/SiteNavigationSchema";

export const metadata: Metadata = {
  metadataBase: new URL('https://printbrawl.com'),
  alternates: {
    canonical: './',
  },
  title: {
    default: "Print Brawl - Design Your Own Custom Apparel & Gifts",
    template: "%s | Print Brawl"
  },
  description: "Express your unique style with Print Brawl. Design your own custom t-shirts, hoodies, and accessories. Perfect for personal use, gifts, and special occasions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://printbrawl.com",
    siteName: "Print Brawl",
    title: "Print Brawl - Design Your Own Custom Apparel & Gifts",
    description: "Express your unique style with Print Brawl. Design your own custom t-shirts, hoodies, and accessories.",
    images: [
      {
        url: "/logov2.webp", // Using logo as fallback OG image
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
    images: ["/logov2.webp"],
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
        <Script
          id="meta-signals-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                !(function(f,b,e,v,vv,n,nn,t,s,tt,ss){
    if (!f.cbq){nn = f.cbq = function(){nn.initialized ? nn.apply(f.cbq, arguments) : nn.queue.push(arguments);};
    if(!f._cbq) f._cbq = nn;
    nn.push = nn; nn.loaded = !0; nn.version = '2.0'; nn.queue = [];
    tt = b.createElement(e); tt.async = !0; tt.src = vv; ss=b.getElementsByTagName(e)[0]; ss.parentNode.insertBefore(tt,ss);}
    if (f.xbq) return; if (f.fbq) f.xbq=f.fbq;
    n = f.fbq = function()
    {if(arguments[0].startsWith('track')){n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);f.cbq.initialized ? f.cbq.apply(f.cbq, arguments) : f.cbq.queue.push(arguments);}
    else{n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);}};
    if(!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = (f.xbq)?f.xbq.queue:[];
    t = b.createElement(e); t.async = !0; t.src = v;s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
  })
  (window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', 'https://tracking.printbrawl.com/sdk/4465668888089880569/events.js');
  fbq('init', '1420495289671184');
  fbq('track', 'PageView');
  cbq('setHost', 'https://tracking.printbrawl.com');
  cbq('init', '4465668888089880569');
  cbq('set', 'integrationMethod', 'forkFromSnippetCode');
  cbq('track', 'PageView');
            `,
          }}
        />
        <OrganizationSchema />
        <WebSiteSchema />
        <SiteNavigationSchema />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <AnalyticsProvider>
                  <PinterestTag />
                  <ClientShell>
                    {children}
                  </ClientShell>
                </AnalyticsProvider>
              </Suspense>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
