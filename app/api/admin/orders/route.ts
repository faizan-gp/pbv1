import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateOrder, getOrderById } from "@/lib/firestore/orders";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status } = await req.json();

        await updateOrder(orderId, { status });
        const updatedOrder = await getOrderById(orderId);

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
