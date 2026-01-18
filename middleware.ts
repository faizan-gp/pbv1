import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
    function middleware(req: NextRequest) {
        const response = NextResponse.next();
        const pathname = req.nextUrl.pathname;

        // If the user is not an admin, redirect to home or show error
        const isAdminRoute = pathname.startsWith("/admin");
        const isCreateProductRoute = pathname.startsWith("/create-product");
        const isEditProductRoute = pathname.startsWith("/edit-product");

        if ((isAdminRoute || isCreateProductRoute || isEditProductRoute) && req.nextauth.token?.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Cache header logic for different route types
        // User-specific routes should not be cached
        const isUserSpecificRoute = 
            pathname.startsWith("/profile") ||
            pathname.startsWith("/cart") ||
            pathname.startsWith("/checkout") ||
            pathname.startsWith("/order-success") ||
            pathname.startsWith("/customize") ||
            pathname.startsWith("/admin");

        if (isUserSpecificRoute) {
            // No cache for user-specific content
            response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
            response.headers.set("CDN-Cache-Control", "private, no-cache, no-store");
            return response;
        }

        // API routes - let the route handlers set their own cache headers
        if (pathname.startsWith("/api")) {
            // Don't override API route cache headers here
            return response;
        }

        // Static pages (About, FAQ, Contact, etc.) - can be cached longer
        const isStaticPage = 
            pathname === "/about" ||
            pathname === "/faq" ||
            pathname === "/contact" ||
            pathname === "/how-it-works" ||
            pathname === "/privacy-policy" ||
            pathname === "/terms-of-service" ||
            pathname === "/dmca";

        if (isStaticPage) {
            // Cache static pages for 1 hour
            response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
            response.headers.set("CDN-Cache-Control", "public, s-maxage=3600");
            return response;
        }

        // Product and category pages - ISR handles caching, but add edge cache headers
        if (pathname.startsWith("/products/") || pathname.startsWith("/categories/")) {
            // Let ISR handle the caching, but add Cloudflare-specific headers
            response.headers.set("CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
            return response;
        }

        // Homepage - ISR handles caching
        if (pathname === "/") {
            response.headers.set("CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
            return response;
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/profile/:path*",
        "/create-product/:path*",
        "/edit-product/:path*",
        "/api/:path*",
        "/products/:path*",
        "/categories/:path*",
        "/about",
        "/faq",
        "/contact",
        "/how-it-works",
        "/privacy-policy",
        "/terms-of-service",
        "/dmca",
        "/",
    ],
};
