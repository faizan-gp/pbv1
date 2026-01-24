import { NextRequest, NextResponse } from 'next/server';
import { updateSessionActivity, endSession } from '@/lib/firestore/analytics';

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

        const { sessionId, end } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
        }

        if (end) {
            // End the session
            await endSession(sessionId);
            return NextResponse.json({ success: true, ended: true });
        }

        // Update session activity (heartbeat)
        await updateSessionActivity(sessionId);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Heartbeat error:', error);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}
