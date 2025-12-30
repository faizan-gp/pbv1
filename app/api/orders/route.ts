import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/firestore/orders";

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


        // Determine user ID (if logged in) or keep null for guest (Firestore doesn't like undefined)
        const userId = session?.user ? (session.user as any).id : null;

        const { uploadBase64Image } = await import("@/lib/storage");

        // Process items: Upload images and sanitize data
        const processedItems = await Promise.all(items.map(async (item: any) => {
            let previewUrl = item.image || null;

            // If image is a base64 string, upload it
            if (previewUrl && typeof previewUrl === 'string' && previewUrl.startsWith('data:image')) {
                try {
                    const uniqueId = Math.random().toString(36).substring(2, 9);
                    const path = `orders/${new Date().toISOString().split('T')[0]}/${uniqueId}.png`;
                    previewUrl = await uploadBase64Image(previewUrl, path);
                } catch (err) {
                    console.error("Failed to upload order image:", err);
                    // Fallback: keep original or set to null if too large? 
                    // Keeping original might fail if it's too big for Firestore, but let's try.
                }
            }

            return {
                productId: item.productId || item.id,
                designId: item.designId || null, // Sanitize undefined -> null
                quantity: item.quantity,
                price: item.price,
                configSnapshot: item.options || {},
                previewSnapshot: previewUrl
            };
        }));

        // Create the order
        const orderId = await createOrder({
            userId: userId,
            items: processedItems,
            total: total,
            status: 'pending',
            shippingDetails: {
                name: shippingDetails.firstName + ' ' + shippingDetails.lastName,
                email: shippingDetails.email,
                address: shippingDetails.address,
                city: shippingDetails.city,
                state: shippingDetails.state,
                postalCode: shippingDetails.postalCode,
                country: 'US',
            }
        });

        return NextResponse.json({ orderId: orderId }, { status: 201 });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 500 });
    }
}
