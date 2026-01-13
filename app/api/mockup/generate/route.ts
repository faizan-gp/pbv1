
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
        const { design, product, options } = body;

        if (!design || (!design.imageUrl && !design.imageBase64)) {
            return NextResponse.json({ success: false, error: 'No design provided' }, { status: 400 });
        }

        // If base64 is provided directly
        if (design.imageBase64 && !design.printifyImageId) {
            // In a real route we might want to upload first to get an ID for better quality? 
            // But the proxy service handles that logic too? 
            // Actually my port `generateMockupPreview` in lib/printify-proxy handles logic:
            // It accepts base64 and puts it in the payload. It DOES NOT upload to S3/Storage first in that specific function unless we call `uploadImage` first.
            // The original code had a check.
            // Let's improve the flow here:

            // 1. Convert base64 to buffer and upload?
            // Actually, for speed, sending base64 in payload works for previews (as seen in original `generateMockupPreview`).
            // It uses: `imageLayer.data = imageBase64...`
            // This is faster. We stick to that.
        }

        const result = await printifyProxy.generateMockupPreview(design, {
            blueprintId: product?.blueprintId || 706,
            providerId: product?.providerId || 99,
            printPosition: design.printPosition || 'front',
            ...options
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Mockup API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
