import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    try {
        // Verify Admin Auth
        const token = await getToken({ req });
        if (!token || token.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Revalidate key paths
        revalidatePath("/", "layout"); // Should clear everything if layout is revalidated

        console.log("[Admin] Cache invalidated by user:", token.email);

        return NextResponse.json({
            success: true,
            message: "Cache invalidated successfully for all paths."
        });

    } catch (error) {
        console.error("Revalidation Error:", error);
        return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
    }
}
