'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-in slide-in-from-right-full fade-in duration-300 ${toast.type === 'success'
                                ? 'bg-white border-green-200 text-green-800'
                                : toast.type === 'error'
                                    ? 'bg-white border-red-200 text-red-800'
                                    : 'bg-white border-gray-200 text-gray-800'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {toast.type === 'success' && (
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                            {toast.type === 'error' && (
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                            {toast.type === 'info' && (
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                            {toast.message}
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
