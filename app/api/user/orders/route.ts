import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/firestore/orders";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const orders = await getUserOrders((session.user as any).id);
        // Sort in memory as getUserOrders helper might not sort
        orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
