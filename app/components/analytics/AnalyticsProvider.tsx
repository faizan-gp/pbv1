'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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

    const sessionIdRef = useRef<string | null>(null);
    const visitorIdRef = useRef<string>('');
    const currentPageViewIdRef = useRef<string | null>(null);
    const pageStartTimeRef = useRef<number>(Date.now());
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Initialize session
    const initSession = useCallback(async () => {
        if (typeof window === 'undefined') return;

        // Check for Do Not Track
        if (navigator.doNotTrack === '1') {
            console.log('Analytics: DNT enabled, skipping tracking');
            return;
        }

        const visitorId = getVisitorId();
        visitorIdRef.current = visitorId;

        const existingSessionId = getStoredSessionId();
        const utm = getUTMParams();

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

            if (res.ok) {
                const data = await res.json();
                sessionIdRef.current = data.sessionId;
                storeSessionId(data.sessionId);
                isInitializedRef.current = true;

                // Track initial page view
                trackPageView(pathname);

                // Start heartbeat
                startHeartbeat();
            }
        } catch (error) {
            console.error('Analytics session error:', error);
        }
    }, [pathname]);

    // Track page view
    const trackPageView = useCallback(async (path: string) => {
        if (!sessionIdRef.current || !visitorIdRef.current) return;

        // First, send time on page for previous page view
        if (currentPageViewIdRef.current) {
            const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
            try {
                await fetch('/api/analytics/pageview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pageViewId: currentPageViewIdRef.current,
                        timeOnPage
                    })
                });
            } catch (e) {
                // Ignore errors on time update
            }
        }

        // Reset page start time
        pageStartTimeRef.current = Date.now();

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

        // Handle visibility change (tab switch)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Send time on page for current page
                if (currentPageViewIdRef.current) {
                    const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
                    const data = JSON.stringify({
                        pageViewId: currentPageViewIdRef.current,
                        timeOnPage
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

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleUnload);
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, [initSession, endSession]);

    // Track route changes
    useEffect(() => {
        if (isInitializedRef.current && pathname) {
            trackPageView(pathname);
        }
    }, [pathname, searchParams, trackPageView]);

    return (
        <AnalyticsContext.Provider value={{ trackEvent }}>
            {children}
        </AnalyticsContext.Provider>
    );
}
