"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";

export default function ProductViewTracker({ product }: { product: any }) {
    useEffect(() => {
        if (product) {
            trackViewItem(product);
        }
    }, [product]);

    return null;
}
