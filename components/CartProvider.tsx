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
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
        
        if (!coupon) return "Érvénytelen kuponkód";
        if (!coupon.isActive) return "Ez a kupon már nem aktív";
        
        const now = new Date();
        if (coupon.startDate) {
            const start = new Date(`${coupon.startDate}T00:00:00`);
            if (now < start) {
                return `Ez a kupon még nem érvényes (kezdés: ${coupon.startDate})`;
            }
        }
        const expiryDate = new Date(`${coupon.expiryDate}T23:59:59`);
        if (now > expiryDate) return "Ez a kupon már lejárt";

        if (coupon.categories && coupon.categories.length > 0) {
            const hasEligibleItem = cartItems.some(item => Boolean(item.category && coupon.categories!.includes(item.category)));
            if (!hasEligibleItem) {
                return "Ez a kupon a kosárban lévő termékek kategóriájára nem érvényes";
            }
        }
        
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
        const hasCategoryFilter = Array.isArray(appliedCoupon.categories) && appliedCoupon.categories.length > 0;
        const eligibleTotal = hasCategoryFilter
            ? cartItems
                .filter(item => Boolean(item.category && appliedCoupon.categories.includes(item.category)))
                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            : Math.max(0, baseTotal - collectionDiscount);

        if (eligibleTotal > 0) {
            if (appliedCoupon.discountType === 'percentage') {
                couponDiscount = Math.round(eligibleTotal * (appliedCoupon.value / 100));
            } else {
                couponDiscount = Math.min(eligibleTotal, appliedCoupon.value);
            }
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
