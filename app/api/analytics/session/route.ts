import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession, updateSession } from '@/lib/firestore/analytics';

// Bot detection patterns
const BOT_PATTERNS = [
    /bot/i, /crawler/i, /spider/i, /crawling/i,
    /googlebot/i, /bingbot/i, /yandex/i, /baidu/i,
    /slurp/i, /duckduck/i, /facebookexternalhit/i,
    /linkedinbot/i, /twitterbot/i, /applebot/i,
    /semrush/i, /ahref/i, /mj12bot/i, /dotbot/i
];

function isBot(userAgent: string): boolean {
    return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function parseDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const ua = userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
}

function parseBrowser(userAgent: string): string {
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/opera|opr/i.test(userAgent)) return 'Opera';
    if (/msie|trident/i.test(userAgent)) return 'IE';
    return 'Other';
}

function parseOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    return 'Other';
}

async function getGeoLocation(ip: string): Promise<{ country?: string; countryCode?: string; city?: string; region?: string }> {
    // Skip for localhost/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Local', countryCode: 'LO', city: 'Localhost', region: 'Local' };
    }

    try {
        // Using ip-api.com (free, no API key, 45 req/min)
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city,regionName`, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (res.ok) {
            const data = await res.json();
            return {
                country: data.country,
                countryCode: data.countryCode,
                city: data.city,
                region: data.regionName
            };
        }
    } catch (error) {
        console.error('Geolocation error:', error);
    }

    return {};
}

function getClientIP(request: NextRequest): string {
    // Try various headers (Vercel, Cloudflare, etc.)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) return cfConnectingIP;

    return '127.0.0.1';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { visitorId, userId, referrer, utmSource, utmMedium, utmCampaign, existingSessionId } = body;

        console.log('[Session API] Received request:', { visitorId, existingSessionId });

        if (!visitorId) {
            return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
        }

        // If existing session provided, just return it (session resume)
        if (existingSessionId) {
            console.log('[Session API] Checking existing session:', existingSessionId);
            const existingSession = await getSession(existingSessionId);
            if (existingSession && existingSession.visitorId === visitorId) {
                console.log('[Session API] Resuming existing session');
                // Update last active time
                await updateSession(existingSessionId, { lastActiveAt: new Date() });
                return NextResponse.json({ sessionId: existingSessionId, resumed: true });
            }
        }

        // Get user agent and IP
        const userAgent = request.headers.get('user-agent') || '';
        const ip = getClientIP(request);
        console.log('[Session API] Client IP:', ip);

        // Get geolocation
        const geo = await getGeoLocation(ip);
        console.log('[Session API] Geo:', geo);

        // Create new session
        const now = new Date();
        console.log('[Session API] Creating session in Firestore...');

        // Build session data, filtering out undefined values (Firestore rejects undefined)
        const sessionData: any = {
            visitorId,
            startedAt: now,
            lastActiveAt: now,
            userAgent,
            device: parseDevice(userAgent),
            browser: parseBrowser(userAgent),
            os: parseOS(userAgent),
            isBot: isBot(userAgent)
        };

        // Add optional fields only if they have values
        if (userId) sessionData.userId = userId;
        if (referrer) sessionData.referrer = referrer;
        if (utmSource) sessionData.utmSource = utmSource;
        if (utmMedium) sessionData.utmMedium = utmMedium;
        if (utmCampaign) sessionData.utmCampaign = utmCampaign;
        if (geo.country) sessionData.country = geo.country;
        if (geo.countryCode) sessionData.countryCode = geo.countryCode;
        if (geo.city) sessionData.city = geo.city;
        if (geo.region) sessionData.region = geo.region;

        const sessionId = await createSession(sessionData);

        console.log('[Session API] Session created with ID:', sessionId);
        return NextResponse.json({ sessionId, created: true });

    } catch (error) {
        console.error('[Session API] Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
