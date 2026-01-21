"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

export default function PageView({ title }: { title?: string }) {
    useEffect(() => {
        trackPageView(window.location.pathname, title);
    }, [title]);

    return null;
}
