import { NextRequest, NextResponse } from 'next/server';
import {
    getAnalyticsStats,
    getDailyStats,
    getActiveSessions,
    getRecentSessions
} from '@/lib/firestore/analytics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'overview';
        const days = parseInt(searchParams.get('days') || '7', 10);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        switch (type) {
            case 'overview': {
                const stats = await getAnalyticsStats(startDate, endDate);
                return NextResponse.json(stats);
            }

            case 'daily': {
                const dailyStats = await getDailyStats(startDate, endDate);
                return NextResponse.json(dailyStats);
            }

            case 'active': {
                const activeSessions = await getActiveSessions(5);
                return NextResponse.json({
                    count: activeSessions.length,
                    sessions: activeSessions.map(s => ({
                        id: s.id,
                        country: s.country,
                        city: s.city,
                        device: s.device,
                        browser: s.browser,
                        pageViewCount: s.pageViewCount,
                        lastActiveAt: s.lastActiveAt
                    }))
                });
            }

            case 'recent': {
                const limit = parseInt(searchParams.get('limit') || '20', 10);
                const recentSessions = await getRecentSessions(limit);
                return NextResponse.json(
                    recentSessions.map(s => ({
                        id: s.id,
                        visitorId: s.visitorId.slice(0, 8) + '...', // Truncate for privacy
                        country: s.country,
                        city: s.city,
                        device: s.device,
                        browser: s.browser,
                        os: s.os,
                        pageViewCount: s.pageViewCount,
                        duration: s.duration,
                        startedAt: s.startedAt,
                        referrer: s.referrer,
                        isBot: s.isBot
                    }))
                );
            }

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
