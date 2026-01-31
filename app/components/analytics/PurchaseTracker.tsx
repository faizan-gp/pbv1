"use client";

import { useEffect, useRef } from "react";
import { trackEvent, fbTrack } from "@/lib/analytics";

export default function PurchaseTracker({ order, products }: { order: any, products: any }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        trackEvent('purchase', {
            transaction_id: order.id,
            value: order.total,
            currency: 'USD',
            tax: 0,
            shipping: 5.99,
            items: order.items.map((item: any) => ({
                item_id: item.productId,
                item_name: products[item.productId]?.name || item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });

        fbTrack('Purchase', {
            value: order.total,
            currency: 'USD',
            content_ids: order.items.map((item: any) => item.productId),
            content_type: 'product',
        });

    }, [order, products]);

    return null;
}
