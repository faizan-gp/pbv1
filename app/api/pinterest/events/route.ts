import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.PINTEREST_CONVERSION_TOKEN;
const PINTEREST_API_URL = `https://api.pinterest.com/v5/ad_accounts/${AD_ACCOUNT_ID}/events`;

interface PinterestEventData {
    event_name: string;
    event_id: string;
    event_time?: number;
    action_source: 'web' | 'app' | 'offline';
    event_source_url?: string;
    user_data: {
        em?: string[];  // Hashed emails
        client_ip_address?: string;
        client_user_agent?: string;
    };
    custom_data?: {
        value?: string;
        currency?: string;
        content_ids?: string[];
        order_id?: string;
        num_items?: number;
        search_string?: string;
    };
}

function hashSHA256(value: string): string {
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function POST(request: NextRequest) {
    if (!AD_ACCOUNT_ID || !ACCESS_TOKEN) {
        console.error('[Pinterest CAPI] Missing credentials');
        return NextResponse.json({ error: 'Pinterest API not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const {
            event_name,
            event_id,
            email,
            value,
            currency,
            content_ids,
            order_id,
            num_items,
            search_string,
            event_source_url
        } = body;

        // Get user data from request headers
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            '';
        const userAgent = request.headers.get('user-agent') || '';

        // Build user_data with hashed email if provided
        const user_data: PinterestEventData['user_data'] = {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
        };

        if (email) {
            user_data.em = [hashSHA256(email)];
        }

        // Build custom_data
        const custom_data: PinterestEventData['custom_data'] = {};
        if (value !== undefined) custom_data.value = String(value);
        if (currency) custom_data.currency = currency;
        if (content_ids?.length) custom_data.content_ids = content_ids;
        if (order_id) custom_data.order_id = order_id;
        if (num_items !== undefined) custom_data.num_items = num_items;
        if (search_string) custom_data.search_string = search_string;

        const eventPayload: PinterestEventData = {
            event_name,
            event_id,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'web',
            event_source_url: event_source_url || '',
            user_data,
            custom_data: Object.keys(custom_data).length > 0 ? custom_data : undefined,
        };

        console.log('[Pinterest CAPI] Sending event:', event_name, event_id);

        const response = await fetch(PINTEREST_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: [eventPayload] }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('[Pinterest CAPI] Error:', result);
            return NextResponse.json({ error: result }, { status: response.status });
        }

        console.log('[Pinterest CAPI] Success:', result);
        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error('[Pinterest CAPI] Exception:', error);
        return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
    }
}
