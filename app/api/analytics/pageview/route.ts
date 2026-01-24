import { NextRequest, NextResponse } from 'next/server';
import { createPageView, updatePageViewTimeOnPage } from '@/lib/firestore/analytics';

export async function POST(request: NextRequest) {
    try {
        // Handle both JSON and text/plain (from sendBeacon)
        const contentType = request.headers.get('content-type') || '';
        let body: any;

        if (contentType.includes('application/json')) {
            body = await request.json();
        } else {
            // sendBeacon sends as text/plain
            const text = await request.text();
            try {
                body = JSON.parse(text);
            } catch {
                return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
            }
        }

        const { sessionId, visitorId, userId, path, title, pageViewId, timeOnPage } = body;

        // If pageViewId and timeOnPage provided, this is an update for time tracking
        if (pageViewId && typeof timeOnPage === 'number') {
            await updatePageViewTimeOnPage(pageViewId, timeOnPage);
            return NextResponse.json({ success: true, updated: true });
        }

        // Otherwise, create a new page view
        if (!sessionId || !visitorId || !path) {
            return NextResponse.json(
                { error: 'sessionId, visitorId, and path are required' },
                { status: 400 }
            );
        }

        const id = await createPageView({
            sessionId,
            visitorId,
            userId,
            path,
            title,
            timestamp: new Date()
        });

        return NextResponse.json({ pageViewId: id, created: true });

    } catch (error) {
        console.error('Page view error:', error);
        return NextResponse.json({ error: 'Failed to log page view' }, { status: 500 });
    }
}
