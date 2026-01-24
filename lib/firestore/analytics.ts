import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    increment,
    addDoc,
    writeBatch
} from "firebase/firestore";

// ================= TYPES =================

export interface AnalyticsSession {
    id: string;
    visitorId: string;
    userId?: string;

    // Timing
    startedAt: Date;
    lastActiveAt: Date;
    endedAt?: Date;
    duration: number; // seconds

    // Location
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;

    // Device & Browser
    userAgent: string;
    device: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;

    // Traffic Source
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;

    // Stats
    pageViewCount: number;
    isBot: boolean;
}

export interface AnalyticsPageView {
    id: string;
    sessionId: string;
    visitorId: string;
    userId?: string;
    path: string;
    title?: string;
    timestamp: Date;
    timeOnPage?: number;
}

export interface AnalyticsEvent {
    id: string;
    sessionId: string;
    visitorId: string;
    eventName: string;
    eventData?: Record<string, any>;
    timestamp: Date;
}

// ================= COLLECTIONS =================

export const SESSIONS_COLLECTION = "analytics_sessions";
export const PAGEVIEWS_COLLECTION = "analytics_pageviews";
export const EVENTS_COLLECTION = "analytics_events";

// ================= DELETE ALL ANALYTICS =================

export async function deleteAllAnalytics(): Promise<{ sessionsDeleted: number; pageViewsDeleted: number }> {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const pageViewsRef = collection(db, PAGEVIEWS_COLLECTION);

    // Get all sessions
    const sessionsSnapshot = await getDocs(sessionsRef);
    const pageViewsSnapshot = await getDocs(pageViewsRef);

    // Delete in batches of 500 (Firestore limit)
    const batch = writeBatch(db);
    let sessionsDeleted = 0;
    let pageViewsDeleted = 0;

    sessionsSnapshot.docs.forEach((docSnap) => {
        batch.delete(doc(db, SESSIONS_COLLECTION, docSnap.id));
        sessionsDeleted++;
    });

    pageViewsSnapshot.docs.forEach((docSnap) => {
        batch.delete(doc(db, PAGEVIEWS_COLLECTION, docSnap.id));
        pageViewsDeleted++;
    });

    await batch.commit();

    return { sessionsDeleted, pageViewsDeleted };
}

// ================= SESSION FUNCTIONS =================

export async function createSession(
    sessionData: Omit<AnalyticsSession, "id" | "duration" | "pageViewCount">
): Promise<string> {
    try {
        console.log('[Firestore] Creating session document...');
        const sessionsRef = collection(db, SESSIONS_COLLECTION);
        const docRef = await addDoc(sessionsRef, {
            ...sessionData,
            startedAt: sessionData.startedAt,
            lastActiveAt: sessionData.lastActiveAt,
            duration: 0,
            pageViewCount: 0
        });
        console.log('[Firestore] Session created:', docRef.id);
        return docRef.id;
    } catch (error: any) {
        console.error('[Firestore] createSession error:', error.message, error.code);
        throw error;
    }
}

export async function getSession(sessionId: string): Promise<AnalyticsSession | null> {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) return null;

    const data = sessionSnap.data();
    return {
        id: sessionSnap.id,
        ...data,
        startedAt: (data.startedAt as Timestamp).toDate(),
        lastActiveAt: (data.lastActiveAt as Timestamp).toDate(),
        endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined
    } as AnalyticsSession;
}

export async function updateSession(
    sessionId: string,
    updates: Partial<AnalyticsSession>
): Promise<void> {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, updates);
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
    const session = await getSession(sessionId);
    if (!session) return;

    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);

    await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
        lastActiveAt: now,
        duration: durationSeconds
    });
}

export async function incrementPageViewCount(sessionId: string): Promise<void> {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
        pageViewCount: increment(1),
        lastActiveAt: new Date()
    });
}

export async function endSession(sessionId: string): Promise<void> {
    const session = await getSession(sessionId);
    if (!session) return;

    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);

    await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
        endedAt: now,
        lastActiveAt: now,
        duration: durationSeconds
    });
}

// ================= PAGEVIEW FUNCTIONS =================

export async function createPageView(
    pageViewData: Omit<AnalyticsPageView, "id">
): Promise<string> {
    const pageViewsRef = collection(db, PAGEVIEWS_COLLECTION);
    const docRef = await addDoc(pageViewsRef, {
        ...pageViewData,
        timestamp: pageViewData.timestamp
    });

    // Increment session page view count
    await incrementPageViewCount(pageViewData.sessionId);

    return docRef.id;
}

export async function updatePageViewTimeOnPage(
    pageViewId: string,
    timeOnPage: number
): Promise<void> {
    const pageViewRef = doc(db, PAGEVIEWS_COLLECTION, pageViewId);
    await updateDoc(pageViewRef, { timeOnPage });
}

export async function getPageViewsBySessionId(
    sessionId: string
): Promise<AnalyticsPageView[]> {
    const pageViewsRef = collection(db, PAGEVIEWS_COLLECTION);
    const q = query(
        pageViewsRef,
        where("sessionId", "==", sessionId),
        orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate()
        } as AnalyticsPageView;
    });
}

// ================= EVENT FUNCTIONS =================

export async function createEvent(
    eventData: Omit<AnalyticsEvent, "id">
): Promise<string> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const docRef = await addDoc(eventsRef, {
        ...eventData,
        timestamp: eventData.timestamp
    });
    return docRef.id;
}

// ================= QUERY FUNCTIONS (for Admin Dashboard) =================

export async function getSessionsByDateRange(
    startDate: Date,
    endDate: Date
): Promise<AnalyticsSession[]> {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
        sessionsRef,
        where("startedAt", ">=", startDate),
        where("startedAt", "<=", endDate),
        orderBy("startedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startedAt: (data.startedAt as Timestamp).toDate(),
            lastActiveAt: (data.lastActiveAt as Timestamp).toDate(),
            endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined
        } as AnalyticsSession;
    });
}

export async function getPageViewsByDateRange(
    startDate: Date,
    endDate: Date
): Promise<AnalyticsPageView[]> {
    const pageViewsRef = collection(db, PAGEVIEWS_COLLECTION);
    const q = query(
        pageViewsRef,
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate),
        orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate()
        } as AnalyticsPageView;
    });
}

export async function getRecentSessions(count: number = 50): Promise<AnalyticsSession[]> {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(sessionsRef, orderBy("startedAt", "desc"), limit(count));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startedAt: (data.startedAt as Timestamp).toDate(),
            lastActiveAt: (data.lastActiveAt as Timestamp).toDate(),
            endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined
        } as AnalyticsSession;
    });
}

export async function getActiveSessions(thresholdMinutes: number = 5): Promise<AnalyticsSession[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
        sessionsRef,
        where("lastActiveAt", ">=", threshold),
        orderBy("lastActiveAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startedAt: (data.startedAt as Timestamp).toDate(),
                lastActiveAt: (data.lastActiveAt as Timestamp).toDate(),
                endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined
            } as AnalyticsSession;
        })
        .filter(s => !s.endedAt); // Exclude ended sessions
}

// ================= AGGREGATION HELPERS =================

export interface AnalyticsStats {
    totalSessions: number;
    uniqueVisitors: number;
    totalPageViews: number;
    avgSessionDuration: number; // seconds
    avgPagesPerSession: number;
    topPages: { path: string; views: number }[];
    topCountries: { country: string; sessions: number }[];
    deviceBreakdown: { device: string; count: number }[];
    bounceRate: number; // percentage of sessions with 1 page view
}

export async function getAnalyticsStats(
    startDate: Date,
    endDate: Date
): Promise<AnalyticsStats> {
    const [sessions, pageViews] = await Promise.all([
        getSessionsByDateRange(startDate, endDate),
        getPageViewsByDateRange(startDate, endDate)
    ]);

    const nonBotSessions = sessions.filter(s => !s.isBot);
    const totalSessions = nonBotSessions.length;
    const uniqueVisitors = new Set(nonBotSessions.map(s => s.visitorId)).size;
    const totalPageViews = pageViews.length;

    const totalDuration = nonBotSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    const totalPagesInSessions = nonBotSessions.reduce((acc, s) => acc + (s.pageViewCount || 0), 0);
    const avgPagesPerSession = totalSessions > 0 ? totalPagesInSessions / totalSessions : 0;

    // Top pages
    const pageCounts: Record<string, number> = {};
    pageViews.forEach(pv => {
        pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Top countries
    const countryCounts: Record<string, number> = {};
    nonBotSessions.forEach(s => {
        const country = s.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
        .map(([country, sessions]) => ({ country, sessions }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    nonBotSessions.forEach(s => {
        deviceCounts[s.device] = (deviceCounts[s.device] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }));

    // Bounce rate
    const bouncedSessions = nonBotSessions.filter(s => s.pageViewCount <= 1).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    return {
        totalSessions,
        uniqueVisitors,
        totalPageViews,
        avgSessionDuration,
        avgPagesPerSession,
        topPages,
        topCountries,
        deviceBreakdown,
        bounceRate
    };
}

// ================= DAILY STATS FOR TRENDS =================

export interface DailyStats {
    date: string; // YYYY-MM-DD
    sessions: number;
    visitors: number;
    pageViews: number;
}

export async function getDailyStats(
    startDate: Date,
    endDate: Date
): Promise<DailyStats[]> {
    const [sessions, pageViews] = await Promise.all([
        getSessionsByDateRange(startDate, endDate),
        getPageViewsByDateRange(startDate, endDate)
    ]);

    const dailyMap: Record<string, { sessions: Set<string>; visitors: Set<string>; pageViews: number }> = {};

    // Initialize days
    const current = new Date(startDate);
    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        dailyMap[dateStr] = { sessions: new Set(), visitors: new Set(), pageViews: 0 };
        current.setDate(current.getDate() + 1);
    }

    // Count sessions
    sessions.filter(s => !s.isBot).forEach(s => {
        const dateStr = s.startedAt.toISOString().split('T')[0];
        if (dailyMap[dateStr]) {
            dailyMap[dateStr].sessions.add(s.id);
            dailyMap[dateStr].visitors.add(s.visitorId);
        }
    });

    // Count page views
    pageViews.forEach(pv => {
        const dateStr = pv.timestamp.toISOString().split('T')[0];
        if (dailyMap[dateStr]) {
            dailyMap[dateStr].pageViews++;
        }
    });

    return Object.entries(dailyMap)
        .map(([date, data]) => ({
            date,
            sessions: data.sessions.size,
            visitors: data.visitors.size,
            pageViews: data.pageViews
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
