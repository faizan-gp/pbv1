import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch SVG' }, { status: response.status });
        }

        const svgText = await response.text();

        return new NextResponse(svgText, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('SVG proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch SVG' }, { status: 500 });
    }
}
