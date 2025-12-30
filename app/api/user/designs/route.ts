import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserDesigns, createDesign } from "@/lib/firestore/designs";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const designs = await getUserDesigns((session.user as any).id);

        return NextResponse.json(designs);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { productId, name, previewImage, config } = await req.json();

        if (!productId || !name || !previewImage) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }


        const designId = await createDesign({
            userId: (session.user as any).id,
            productId,
            name,
            previewImage,
            config,
        });

        // Construct response with ID (createDesign returns ID)
        const newDesign = {
            id: designId,
            userId: (session.user as any).id,
            productId,
            name,
            previewImage,
            config,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return NextResponse.json(newDesign, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
