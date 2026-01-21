"use client";

import { useEffect } from "react";
import { trackEvent, fbTrack } from "@/lib/analytics";

export default function ProductListTracker({ products, category }: { products: any[], category?: string }) {
    useEffect(() => {
        if (!products || products.length === 0) return;

        trackEvent('view_item_list', {
            item_list_name: category || 'All Products',
            items: products.slice(0, 20).map(p => ({ // limit items sent to GA4 to avoid payload size limits
                item_id: p.id,
                item_name: p.name,
                price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
            }))
        });

        fbTrack('ViewContent', {
            content_type: 'product_group',
            content_ids: products.slice(0, 10).map(p => p.id),
            content_category: category || 'All Products'
        });

    }, [products, category]);

    return null;
}
