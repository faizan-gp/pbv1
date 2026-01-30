import { analytics } from './firebase';
import { logEvent as firebaseLogEvent, Analytics } from 'firebase/analytics';

// Define Window interface to include fbq and cbq
declare global {
    interface Window {
        fbq: any;
        cbq: any;
        pintrk: any;
    }
}

// --- HELPER FUNCTIONS ---

const isInternalUser = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pb_internal_user') === 'true';
};

// Generate unique event ID for deduplication
export const generateEventId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Get user email from session (for CAPI)
const getUserEmail = (): string | null => {
    if (typeof window === 'undefined') return null;
    // Try to get from localStorage or session - this would be set during login
    return localStorage.getItem('pb_user_email') || null;
};

// Send event to Pinterest server-side API
export const sendPinterestServerEvent = async (
    eventName: string,
    eventId: string,
    params?: Record<string, any>
) => {
    if (isInternalUser()) return;
    if (typeof window === 'undefined') return;

    try {
        await fetch('/api/pinterest/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                event_id: eventId,
                email: getUserEmail(),
                event_source_url: window.location.href,
                ...params
            })
        });
    } catch (error) {
        console.warn('[Pinterest CAPI] Failed to send server event:', error);
    }
};

// Browser-side Pinterest tracking with event_id
export const pinterestTrack = (eventName: string, eventId?: string, params?: Record<string, any>) => {
    if (isInternalUser()) return;
    if (typeof window !== 'undefined' && window.pintrk) {
        const trackParams = { ...params };
        if (eventId) trackParams.event_id = eventId;
        window.pintrk('track', eventName, trackParams);
    }
};

// --- GA4 FUNCTIONS ---

/**
 * Safely logs an event to Firebase Analytics
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (isInternalUser()) return;
    if (analytics && typeof window !== 'undefined') {
        try {
            firebaseLogEvent(analytics, eventName, params);
        } catch (error) {
            console.warn(`GA4 Error: Failed to track ${eventName}`, error);
        }
    }
};

/**
 * Sets user properties in GA4
 */
export const setUserProperties = (userId: string, userProperties?: Record<string, any>) => {
    if (isInternalUser()) return;
    if (analytics && typeof window !== 'undefined') {
        try {
            // Note: firebase/analytics 'setUserProperties' is different from 'logEvent', 
            // but the modular SDK uses setUserProperties imported from firebase/analytics.
            // We need to import it. But wait, I only imported logEvent.
            // Let's import setUserProperties dynamically or at top if available.
            // Actually, verify import from 'firebase/analytics'.
            // For now, simpler to just log a 'set_user_property' event or relevant login event
            // as standard setUserProperties might need explicit import.
            // I'll add the import below.
            import('firebase/analytics').then(({ setUserProperties }) => {
                if (analytics) {
                    setUserProperties(analytics, { user_id: userId, ...userProperties });
                }
            });
        } catch (error) {
            console.warn("GA4 Error: Failed to set user properties", error);
        }
    }
}


// --- META PIXEL FUNCTIONS ---

/**
 * Safely logs an event to Meta Pixel (fbq) and Signals (cbq)
 */
export const fbTrack = (eventName: string, params?: Record<string, any>, eventID?: string) => {
    if (isInternalUser()) return;
    if (typeof window !== 'undefined') {
        const payload = params || {};
        if (eventID) payload.eventID = eventID;

        // Meta Pixel
        if (window.fbq) {
            window.fbq('track', eventName, payload);
        }

        // Signals Gateway (cbq)
        if (window.cbq) {
            window.cbq('track', eventName, payload);
        }
    }
};

/**
 * Logs a custom event to Meta Pixel
 */
export const fbTrackCustom = (eventName: string, params?: Record<string, any>) => {
    if (isInternalUser()) return;
    if (typeof window !== 'undefined') {
        if (window.fbq) window.fbq('trackCustom', eventName, params);
        if (window.cbq) window.cbq('trackCustom', eventName, params);
    }
};


// --- COMBINED E-COMMERCE EVENTS ---

export const trackPageView = (url: string, title?: string) => {
    trackEvent('page_view', { page_location: url, page_title: title });
    // Meta Pixel tracks PageView automatically via the script in layout.tsx
    // But we might want to track virtual page views if using client-side routing heavily without full reloads?
    // Next.js App Router usually triggers route changes. The script in layout runs once.
    // Ideally we listen to pathname changes.
};

export const trackAddToCart = (product: any, variant: string | null) => {
    const value = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const currency = 'USD';
    const eventId = generateEventId();

    // GA4
    trackEvent('add_to_cart', {
        currency: currency,
        value: value,
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: value,
            quantity: 1,
            item_variant: variant || 'default'
        }]
    });

    // Meta
    fbTrack('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: value,
        currency: currency,
        contents: [{
            id: product.id,
            quantity: 1
        }]
    });

    // Pinterest Browser
    pinterestTrack('addtocart', eventId, {
        value: value,
        currency: currency,
        line_items: [{
            product_id: product.id,
            product_name: product.name,
            product_price: value,
            product_quantity: 1
        }]
    });

    // Pinterest Server (CAPI)
    sendPinterestServerEvent('add_to_cart', eventId, {
        value: value,
        currency: currency,
        content_ids: [product.id]
    });
};

export const trackRemoveFromCart = (cartItem: any) => {
    // GA4
    trackEvent('remove_from_cart', {
        currency: 'USD',
        value: cartItem.price,
        items: [{
            item_id: cartItem.productId,
            item_name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity
        }]
    });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
    // GA4
    trackEvent('begin_checkout', {
        currency: 'USD',
        value: totalValue,
        items: cartItems.map(item => ({
            item_id: item.productId,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Meta
    fbTrack('InitiateCheckout', {
        content_ids: cartItems.map(i => i.productId),
        content_type: 'product',
        value: totalValue,
        currency: 'USD',
        num_items: cartItems.length,
        contents: cartItems.map(i => ({
            id: i.productId,
            quantity: i.quantity
        }))
    });
};

export const tracksearch = (searchTerm: string) => {
    const eventId = generateEventId();

    trackEvent('search', { search_term: searchTerm });
    fbTrack('Search', { search_string: searchTerm });

    // Pinterest Browser
    pinterestTrack('search', eventId, { search_query: searchTerm });

    // Pinterest Server (CAPI)
    sendPinterestServerEvent('search', eventId, { search_string: searchTerm });
}

export const trackViewItem = (product: any) => {
    const value = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    trackEvent('view_item', {
        currency: 'USD',
        value: value,
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: value
        }]
    });

    fbTrack('ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        content_name: product.name,
        value: value,
        currency: 'USD'
    });

    // Pinterest Browser
    pinterestTrack('pagevisit', undefined, {
        value: value,
        currency: 'USD',
        product_id: product.id,
        line_items: [{
            product_id: product.id,
            product_name: product.name,
            product_price: value,
            product_quantity: 1
        }]
    });
}

export const trackPurchase = (orderId: string, total: number, items: any[]) => {
    const currency = 'USD';
    const eventId = generateEventId();

    // GA4
    trackEvent('purchase', {
        transaction_id: orderId,
        value: total,
        currency: currency,
        tax: 0,
        shipping: 5.99,
        items: items.map((item: any) => ({
            item_id: item.productId,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Meta
    fbTrack('Purchase', {
        value: total,
        currency: currency,
        content_ids: items.map((item: any) => item.productId),
        content_type: 'product',
        num_items: items.reduce((acc, item) => acc + item.quantity, 0)
    });

    // Pinterest Browser
    pinterestTrack('checkout', eventId, {
        value: total,
        currency: currency,
        order_id: orderId,
        line_items: items.map((item: any) => ({
            product_id: item.productId,
            product_name: item.name,
            product_price: item.price,
            product_quantity: item.quantity
        }))
    });

    // Pinterest Server (CAPI)
    sendPinterestServerEvent('checkout', eventId, {
        value: total,
        currency: currency,
        order_id: orderId,
        content_ids: items.map((item: any) => item.productId),
        num_items: items.reduce((acc, item) => acc + item.quantity, 0)
    });
};
