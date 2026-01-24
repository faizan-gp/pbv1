import { NextRequest, NextResponse } from 'next/server';
import { getSession, getPageViewsBySessionId } from '@/lib/firestore/analytics';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const session = await getSession(id);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const pageViews = await getPageViewsBySessionId(id);

        return NextResponse.json({
            session: {
                id: session.id,
                visitorId: session.visitorId,
                userId: session.userId,
                startedAt: session.startedAt,
                lastActiveAt: session.lastActiveAt,
                endedAt: session.endedAt,
                duration: session.duration,
                country: session.country,
                countryCode: session.countryCode,
                city: session.city,
                region: session.region,
                device: session.device,
                browser: session.browser,
                os: session.os,
                referrer: session.referrer,
                utmSource: session.utmSource,
                utmMedium: session.utmMedium,
                utmCampaign: session.utmCampaign,
                pageViewCount: session.pageViewCount,
                isBot: session.isBot
            },
            pageViews: pageViews.map(pv => ({
                id: pv.id,
                path: pv.path,
                title: pv.title,
                timestamp: pv.timestamp,
                timeOnPage: pv.timeOnPage
            }))
        });

    } catch (error) {
        console.error('Session detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
}
