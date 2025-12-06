"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string; // Unique ID for the cart entry (e.g. productID + color + options)
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    options: {
        color?: string;
        size?: string;
        customText?: string;
        // Add other customization options here
    };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
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

    const addToCart = (newItem: Omit<CartItem, "id">) => {
        setItems((prev) => {
            // Simple logic: if exact same product + options, increment quantity
            // For customization, we usually want unique entries if text differs, etc.
            // Here generating a unique ID based on simple properties + random to allow multiples
            // Or we can check for deep equality of options.

            // Let's assume every customization is unique for now to be safe
            const id = `${newItem.productId}-${Date.now()}`;
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
