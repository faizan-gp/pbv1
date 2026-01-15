
import { NextRequest, NextResponse } from 'next/server';
import { printifyProxy } from '@/lib/printify-proxy';

// Force dynamic since we use headers/cookies (though hidden inside proxy)
// Actually we use env vars mostly, but let's be safe.
export const dynamic = 'force-dynamic';

// Increase max duration if possible (Vercel specific, but good practice)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { design, designs, product, options } = body;

        // Normalize designs input
        // Users might send `design` (single) or `designs` (map)
        let designsMap: Record<string, any> = {};

        if (designs) {
            designsMap = designs;
        } else if (design) {
            // Legacy single design support
            const pos = design.printPosition || 'front';
            designsMap[pos] = design;
        }

        if (Object.keys(designsMap).length === 0) {
            return NextResponse.json({ success: false, error: 'No designs provided' }, { status: 400 });
        }

        const result = await printifyProxy.generateMockupPreview(designsMap, {
            blueprintId: product?.blueprintId || 706,
            providerId: product?.providerId || 25,
            ...options
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mockup API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
