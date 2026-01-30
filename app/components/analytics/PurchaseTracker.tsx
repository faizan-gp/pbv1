"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics";

export default function PurchaseTracker({ order, products }: { order: any, products: any }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        const items = order.items.map((item: any) => ({
            productId: item.productId,
            name: products[item.productId]?.name || item.name,
            price: item.price,
            quantity: item.quantity
        }));

        trackPurchase(order.id, order.total, items);

    }, [order, products]);

    return null;
}
