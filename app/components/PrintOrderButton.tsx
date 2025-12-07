'use client';

import { Printer } from "lucide-react";

export default function PrintOrderButton() {
    return (
        <button
            onClick={() => window.print()}
            className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-2"
        >
            <Printer size={16} /> Print Receipt
        </button>
    );
}
