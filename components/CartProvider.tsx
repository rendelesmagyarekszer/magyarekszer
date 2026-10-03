"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/lib/data';
import { useConfig } from './ConfigProvider';

interface CartItem extends Product {
    quantity: number;
    selectedCustomization?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, customization?: string) => void;
    removeFromCart: (productId: string, customization?: string) => void;
    clearCart: () => void;
    totalAmount: number;
    discountAmount: number;
    baseTotal: number;
    appliedCoupon: any | null;
    applyCoupon: (code: string) => string | null; // returns error message or null if success
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { coupons } = useConfig();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial Load
    useEffect(() => {
        const saved = localStorage.getItem('magyarekszer_cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Sync to Storage
    useEffect(() => {
        // Only sync if explicitly initialized to avoid overwriting with empty state
        if (isInitialized) {
            localStorage.setItem('magyarekszer_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);

    const addToCart = (product: Product, customization?: string) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => 
                item.id === product.id && item.selectedCustomization === customization
            );
            if (existingItem) {
                return prev.map(item => 
                    (item.id === product.id && item.selectedCustomization === customization)
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, selectedCustomization: customization }];
        });
    };

    const removeFromCart = (productId: string, customization?: string) => {
        setCartItems(prev => prev.filter(item => 
            !(item.id === productId && item.selectedCustomization === customization)
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const applyCoupon = (code: string) => {
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        
        if (!coupon) return "Érvénytelen kuponkód";
        if (!coupon.isActive) return "Ez a kupon már nem aktív";
        
        const expiryDate = new Date(coupon.expiryDate);
        const now = new Date();
        if (expiryDate < now) return "Ez a kupon már lejárt";
        
        setAppliedCoupon(coupon);
        return null; // Success
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const getCollectionDiscount = (items: CartItem[]) => {
        let discount = 0;
        const colls: Record<string, number> = {};
        const collTotals: Record<string, number> = {};
        
        items.forEach(item => {
            if (item.collectionId) {
                colls[item.collectionId] = (colls[item.collectionId] || 0) + item.quantity;
                collTotals[item.collectionId] = (collTotals[item.collectionId] || 0) + (item.price * item.quantity);
            }
        });
        
        Object.keys(colls).forEach(cId => {
            const q = colls[cId];
            if (q === 2) {
                discount += collTotals[cId] * 0.05;
            } else if (q >= 3) {
                discount += collTotals[cId] * 0.10;
            }
        });
        return Math.round(discount);
    };

    const baseTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const collectionDiscount = getCollectionDiscount(cartItems);
    
    let couponDiscount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
            couponDiscount = Math.round((baseTotal - collectionDiscount) * (appliedCoupon.value / 100));
        } else {
            couponDiscount = appliedCoupon.value;
        }
    }

    const discountAmount = collectionDiscount + couponDiscount;
    const totalAmount = Math.max(0, baseTotal - discountAmount);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            totalAmount, 
            discountAmount, 
            baseTotal,
            appliedCoupon,
            applyCoupon,
            removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
