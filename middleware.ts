import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
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
            // Cache static pages: 1 hour browser, 1 day CDN
            response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
            
            // Add ETag and Last-Modified for cache validation
            const now = new Date();
            const etag = createHash("md5").update(`${pathname}-${Math.floor(now.getTime() / 3600000)}`).digest("hex");
            response.headers.set("ETag", `"${etag}"`);
            response.headers.set("Last-Modified", now.toUTCString());
            
            return response;
        }

        // Product and category pages - ISR handles caching, but add edge cache headers
        if (pathname.startsWith("/products/") || pathname.startsWith("/categories/")) {
            // Cache: 5 min browser, 15 min CDN, stale for 1 hour
            response.headers.set("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600");
            
            // Add ETag and Last-Modified for cache validation
            // For ISR pages, use revalidation interval (900s = 15min) to generate stable ETags
            const now = new Date();
            const revalidateInterval = 900; // 15 minutes
            const timeBucket = Math.floor(now.getTime() / 1000 / revalidateInterval);
            const etag = createHash("md5").update(`${pathname}-${timeBucket}`).digest("hex");
            response.headers.set("ETag", `"${etag}"`);
            response.headers.set("Last-Modified", now.toUTCString());
            
            return response;
        }

        // Homepage - ISR handles caching
        if (pathname === "/") {
            // Cache: 5 min browser, 15 min CDN, stale for 1 hour
            response.headers.set("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600");
            
            // Add ETag and Last-Modified for cache validation
            // Homepage revalidates every 900s (15 min), so generate ETag based on that interval
            const now = new Date();
            const revalidateInterval = 900; // 15 minutes (matches revalidate = 900)
            const timeBucket = Math.floor(now.getTime() / 1000 / revalidateInterval);
            const etag = createHash("md5").update(`${pathname}-${timeBucket}`).digest("hex");
            response.headers.set("ETag", `"${etag}"`);
            response.headers.set("Last-Modified", now.toUTCString());
            
            return response;
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;
                console.log(`[Middleware] Checking path: ${pathname}`);

                // Public routes - no authentication required
                const isPublicRoute =
                    pathname === "/" ||
                    pathname.startsWith("/products") ||
                    pathname.startsWith("/categories") ||
                    pathname.startsWith("/api/products") ||
                    pathname.startsWith("/api/categories") ||
                    pathname === "/about" ||
                    pathname === "/faq" ||
                    pathname === "/contact" ||
                    pathname === "/how-it-works" ||
                    pathname === "/privacy-policy" ||
                    pathname === "/terms-of-service" ||
                    pathname === "/dmca" ||
                    pathname === "/login" ||
                    pathname === "/signup" ||
                    pathname.startsWith("/_next") ||
                    pathname.startsWith("/images");

                console.log(`[Middleware] isPublicRoute: ${isPublicRoute}, hasToken: ${!!token}`);

                if (isPublicRoute) {
                    return true; // Allow access without authentication
                }

                // Protected routes require authentication
                return !!token;
            },
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
