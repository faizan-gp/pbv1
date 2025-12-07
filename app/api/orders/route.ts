import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Removed strict session check to allow Guest Checkout
        // if (!session || !session.user) {
        //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        // }

        const { items, shippingDetails, paymentMethod, total } = await req.json();

        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json({ message: "No items in order" }, { status: 400 });
        }
        if (!shippingDetails) {
            return NextResponse.json({ message: "Shipping details required" }, { status: 400 });
        }

        await dbConnect();

        // Determine user ID (if logged in) or keep undefined for guest
        const userId = session?.user ? (session.user as any).id : undefined;

        // Create the order
        const newOrder = await Order.create({
            userId: userId,
            items: items.map((item: any) => ({
                productId: item.productId || item.id, // Handle both id formats
                quantity: item.quantity,
                price: item.price,
                // Add snapshots if available, or just basics
                configSnapshot: item.options,
                previewSnapshot: item.image
            })),
            total: total,
            status: 'pending',
            shippingDetails: {
                name: shippingDetails.firstName + ' ' + shippingDetails.lastName,
                email: shippingDetails.email,
                address: shippingDetails.address,
                city: shippingDetails.city,
                state: shippingDetails.state,
                postalCode: shippingDetails.postalCode,
                country: 'US', // Defaulting for now
            }
        });

        return NextResponse.json({ orderId: newOrder._id }, { status: 201 });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 500 });
    }
}
