"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncCartToFirestore } from "@/lib/firestore/carts";

export interface CartItem {
    id: string; // Unique ID for the cart entry (e.g. productID + color + options)
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    previews?: Record<string, string>; // Map of viewId -> base64/url
    designState?: Record<string, any>; // Map of viewId -> Fabric JSON
    options: {
        color?: string;
        size?: string;
        customText?: string;
        // Add other customization options here
    };
    shippingCost?: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    updateItem: (id: string, updates: Partial<CartItem>) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    // Sync to Firestore (Authenticated Users)
    const { data: session } = useSession();
    useEffect(() => {
        if (isLoaded && session?.user?.email) {
            // Debounce or just sync? For now, sync on every change (low frequency expected)
            // But let's wrap in a timeout to avoid rapid updates if multiple items added quickly
            const timer = setTimeout(() => {
                const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                if (session?.user?.email) {
                    syncCartToFirestore(
                        (session.user as any).id || session.user.email,
                        session.user.email,
                        items,
                        total
                    );
                }
            }, 2000); // 2 second debounce

            return () => clearTimeout(timer);
        }
    }, [items, isLoaded, session]);

    const addToCart = (newItem: Omit<CartItem, "id">) => {
        setItems((prev) => {
            // Simple logic: if exact same product + options, increment quantity
            // For customization, we usually want unique entries if text differs, etc.
            // Here generating a unique ID based on simple properties + random to allow multiples
            // Or we can check for deep equality of options.

            // Ensure unique ID even if added in same millisecond
            const uniqueSuffix = Math.random().toString(36).substring(2, 9);
            const id = `${newItem.productId}-${Date.now()}-${uniqueSuffix}`;
            return [...prev, { ...newItem, id, quantity: newItem.quantity }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateItem: (id: string, updates: Partial<CartItem>) => {
                    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
                },
                clearCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
