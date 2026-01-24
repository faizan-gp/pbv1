import { NextResponse } from 'next/server';
import { deleteAllAnalytics } from '@/lib/firestore/analytics';

export async function DELETE() {
    try {
        const result = await deleteAllAnalytics();

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.sessionsDeleted} sessions and ${result.pageViewsDeleted} page views`,
            ...result
        });
    } catch (error: any) {
        console.error('[Clear Analytics] Error:', error);
        return NextResponse.json({
            error: 'Failed to clear analytics data'
        }, { status: 500 });
    }
}
