import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // If the user is not an admin, redirect to home or show error
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const isCreateProductRoute = req.nextUrl.pathname.startsWith("/create-product");
        const isEditProductRoute = req.nextUrl.pathname.startsWith("/edit-product");

        if ((isAdminRoute || isCreateProductRoute || isEditProductRoute) && req.nextauth.token?.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/profile/:path*", "/create-product/:path*", "/edit-product/:path*"],
};
