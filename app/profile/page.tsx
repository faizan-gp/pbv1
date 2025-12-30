import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { getUserDesigns } from "@/lib/firestore/designs";
import { getUserOrders } from "@/lib/firestore/orders";
import ProfileDashboard from "../components/ProfileDashboard";
import Navbar from "../components/Navbar";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }


    // Fetch Designs
    const designs = await getUserDesigns((session.user as any).id);

    // Fetch Orders
    const orders = await getUserOrders((session.user as any).id);

    // Serialize objects (convert Dates to strings if needed for basic props)
    // .lean() is not needed for Firestore, but serialization ensures plain objects
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
