import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Order from "@/models/Order";
import ProfileDashboard from "../components/ProfileDashboard";
import Navbar from "../components/Navbar";
import { Types } from "mongoose";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }

    await dbConnect();

    // Fetch Designs
    const designs = await Design.find({ userId: new Types.ObjectId((session.user as any).id) })
        .sort({ createdAt: -1 })
        .lean();

    // Fetch Orders
    const orders = await Order.find({ userId: (session.user as any).id })
        .sort({ createdAt: -1 })
        .lean();

    // Serialize MongoDB objects (convert _id/dates to strings if needed for basic props)
    // .lean() helps, but sometimes Dates need manual string conversion for Next.js props
    const serializedDesigns = JSON.parse(JSON.stringify(designs));
    const serializedOrders = JSON.parse(JSON.stringify(orders));

    return (
        <div className="min-h-screen bg-slate-50">
            <ProfileDashboard
                user={session.user}
                designs={serializedDesigns}
                orders={serializedOrders}
            />
        </div>
    );
}
