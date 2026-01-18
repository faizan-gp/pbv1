'use client';

import { useState } from 'react';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../Toast';

export default function CacheInvalidateButton() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleInvalidate = async () => {
        if (!confirm("Are you sure you want to clear the entire site cache? This may cause temporary higher server load.")) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/revalidate', { method: 'POST' });
            if (!res.ok) throw new Error("Failed to revalidate");

            showToast("Cache invalidated successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to clear cache", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleInvalidate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear Cache (Revalidate All Paths)"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-yellow-400" />}
            {loading ? "Clearing..." : "Clear Cache"}
        </button>
    );
}
