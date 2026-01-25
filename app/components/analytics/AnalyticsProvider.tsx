'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AnalyticsContextType {
    trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    trackEvent: () => { }
});

export const useAnalytics = () => useContext(AnalyticsContext);

// Generate or retrieve visitor ID
function getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    const VISITOR_KEY = 'pb_visitor_id';
    let visitorId = localStorage.getItem(VISITOR_KEY);

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
    }

    return visitorId;
}

// Get session ID from sessionStorage
function getStoredSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('pb_session_id');
}

function storeSessionId(sessionId: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('pb_session_id', sessionId);
    }
}

// Parse UTM parameters
function getUTMParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined
    };
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    const sessionIdRef = useRef<string | null>(null);
    const visitorIdRef = useRef<string>('');
    const currentPageViewIdRef = useRef<string | null>(null);
    const pageStartTimeRef = useRef<number>(Date.now());
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = React.useState(false);
    const maxScrollDepthRef = useRef<number>(0); // Track max scroll percentage
    const lastTrackedPathRef = useRef<string>(''); // Prevent duplicate page views

    // Mark as internal user if role is admin
    useEffect(() => {
        if (session?.user && (session.user as any).role === 'admin') {
            if (localStorage.getItem('pb_internal_user') !== 'true') {
                localStorage.setItem('pb_internal_user', 'true');
                console.log('[Analytics] Admin role detected, marking as internal user');
            }
        }
    }, [session]);

    // Initialize session
    const initSession = useCallback(async () => {
        if (typeof window === 'undefined') return;

        // Check if internal user (visited admin before)
        const isInternalUser = localStorage.getItem('pb_internal_user') === 'true';

        // Check/Set internal status
        if (window.location.pathname.startsWith('/admin')) {
            if (!isInternalUser) {
                localStorage.setItem('pb_internal_user', 'true');
                console.log('[Analytics] Marked as internal user');
            }
            return; // Don't track admin pages
        }

        // Skip tracking for internal users on public pages too
        if (isInternalUser) {
            console.log('[Analytics] Internal user detected, skipping session');
            return;
        }

        // Check for Do Not Track
        if (navigator.doNotTrack === '1') {
            console.log('Analytics: DNT enabled, skipping tracking');
            return;
        }

        const visitorId = getVisitorId();
        visitorIdRef.current = visitorId;
        console.log('[Analytics] Visitor ID:', visitorId);

        const existingSessionId = getStoredSessionId();
        const utm = getUTMParams();
        console.log('[Analytics] Creating session...', { existingSessionId, utm });

        try {
            const res = await fetch('/api/analytics/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    existingSessionId,
                    referrer: document.referrer || undefined,
                    ...utm
                })
            });

            console.log('[Analytics] Session API response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[Analytics] Session created:', data);
                sessionIdRef.current = data.sessionId;
                storeSessionId(data.sessionId);
                setIsInitialized(true);

                // Track the first page view immediately
                const currentPath = window.location.pathname;
                console.log('[Analytics] Tracking initial page:', currentPath);

                // Send the first page view
                try {
                    const pvRes = await fetch('/api/analytics/pageview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: data.sessionId,
                            visitorId: visitorIdRef.current,
                            path: currentPath,
                            title: document.title
                        })
                    });
                    if (pvRes.ok) {
                        const pvData = await pvRes.json();
                        currentPageViewIdRef.current = pvData.pageViewId;
                        lastTrackedPathRef.current = currentPath;
                        console.log('[Analytics] Initial page view created:', pvData.pageViewId);
                    }
                } catch (e) {
                    console.error('[Analytics] Failed to track initial page:', e);
                }

                // Start heartbeat
                startHeartbeat();
            } else {
                const errorText = await res.text();
                console.error('[Analytics] Session creation failed:', errorText);
            }
        } catch (error) {
            console.error('Analytics session error:', error);
        }
    }, []); // Run only once on mount

    // Track page view
    const trackPageView = useCallback(async (path: string) => {
        if (!sessionIdRef.current || !visitorIdRef.current) return;

        // Check if internal user
        if (localStorage.getItem('pb_internal_user') === 'true') {
            console.log('[Analytics] Skipping internal user for:', path);
            return;
        }

        console.log('[Analytics] Tracking page view for:', path);

        // Skip tracking for admin pages
        if (path.startsWith('/admin')) {
            console.log('[Analytics] Skipping admin page');
            return;
        }

        // Prevent duplicate tracking of the same path
        if (path === lastTrackedPathRef.current) {
            console.log('[Analytics] Duplicate path detected, skipping:', path);
            return;
        }
        lastTrackedPathRef.current = path;

        // First, send time on page and scroll depth for previous page view
        if (currentPageViewIdRef.current) {
            const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
            const scrollDepth = Math.round(maxScrollDepthRef.current);
            try {
                await fetch('/api/analytics/pageview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pageViewId: currentPageViewIdRef.current,
                        timeOnPage,
                        scrollDepth
                    })
                });
            } catch (e) {
                // Ignore errors on time update
            }
        }

        // Reset page start time and scroll depth
        pageStartTimeRef.current = Date.now();
        maxScrollDepthRef.current = 0;

        try {
            const res = await fetch('/api/analytics/pageview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    visitorId: visitorIdRef.current,
                    path,
                    title: document.title
                })
            });

            if (res.ok) {
                const data = await res.json();
                currentPageViewIdRef.current = data.pageViewId;
            }
        } catch (error) {
            console.error('Analytics pageview error:', error);
        }
    }, []);

    // Heartbeat to update session activity
    const sendHeartbeat = useCallback(async () => {
        if (!sessionIdRef.current) return;

        try {
            await fetch('/api/analytics/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionIdRef.current })
            });
        } catch (error) {
            // Ignore heartbeat errors
        }
    }, []);

    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        // Send heartbeat every 30 seconds
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);
    }, [sendHeartbeat]);

    // End session on page unload
    const endSession = useCallback(async () => {
        if (!sessionIdRef.current) return;

        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
            sessionId: sessionIdRef.current,
            end: true
        });

        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/heartbeat', data);
        } else {
            // Fallback for older browsers
            try {
                await fetch('/api/analytics/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true
                });
            } catch (e) {
                // Ignore
            }
        }
    }, []);

    // Track custom events
    const trackEvent = useCallback(async (eventName: string, eventData?: Record<string, any>) => {
        if (!sessionIdRef.current || !visitorIdRef.current) return;

        try {
            await fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    visitorId: visitorIdRef.current,
                    eventName,
                    eventData
                })
            });
        } catch (error) {
            console.error('Analytics event error:', error);
        }
    }, []);

    // Initialize on mount
    useEffect(() => {
        initSession();

        // Track scroll depth
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (docHeight > 0) {
                const scrollPercent = (scrollTop / docHeight) * 100;
                if (scrollPercent > maxScrollDepthRef.current) {
                    maxScrollDepthRef.current = scrollPercent;
                }
            }
        };

        // Handle visibility change (tab switch)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Send time on page and scroll depth for current page
                if (currentPageViewIdRef.current) {
                    const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
                    const scrollDepth = Math.round(maxScrollDepthRef.current);
                    const data = JSON.stringify({
                        pageViewId: currentPageViewIdRef.current,
                        timeOnPage,
                        scrollDepth
                    });
                    navigator.sendBeacon?.('/api/analytics/pageview', data);
                }
            } else if (document.visibilityState === 'visible') {
                // Resume tracking
                pageStartTimeRef.current = Date.now();
            }
        };

        // Handle page unload
        const handleUnload = () => {
            endSession();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleUnload);
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, [initSession, endSession]);

    // Track route changes
    useEffect(() => {
        if (isInitialized && pathname) {
            trackPageView(pathname);
        }
    }, [pathname, searchParams, trackPageView, isInitialized]);

    return (
        <AnalyticsContext.Provider value={{ trackEvent }}>
            {children}
        </AnalyticsContext.Provider>
    );
}
