"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    fullName: string;
    email: string;
    address?: string;
    postcode?: string;
    city?: string;
    phone?: string;
    password?: string;
}

export interface Order {
    id: string;
    userId: string; // email or 'guest'
    items: any[];
    total: number;
    date: string;
    status: 'pending' | 'shipped' | 'delivered';
    viewed?: boolean;
    comment?: string;
    customerInfo: {
        fullName: string;
        email: string;
        phone: string;
    };
    shippingInfo: {
        postcode: string;
        city: string;
        address: string;
        method: string;
    };
    billingInfo: {
        isCompany: boolean;
        name: string;
        postcode: string;
        city: string;
        address: string;
        taxNumber?: string;
    };
    paymentMethod: string;
    premiumBox?: boolean;
    marketingConsent?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    register: (userData: User) => boolean;
    logout: () => void;
    updateUser: (userData: User) => void;
    orders: Order[];
    allOrders: Order[];
    allUsers: User[];
    addOrder: (order: Omit<Order, 'id' | 'userId' | 'date' | 'status' | 'viewed'>) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    markOrderAsViewed: (orderId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load everything from localStorage on mount
    useEffect(() => {
        const savedUsers = localStorage.getItem('magyarekszer_all_users');
        const currentUser = localStorage.getItem('magyarekszer_current_user');
        const savedOrders = localStorage.getItem('magyarekszer_orders');

        if (savedUsers) {
            try {
                const parsed = JSON.parse(savedUsers);
                if (Array.isArray(parsed)) setAllUsers(parsed);
            } catch (e) {}
        }
        if (currentUser) {
            try {
                const parsed = JSON.parse(currentUser);
                if (parsed) setUser(parsed);
            } catch (e) {}
        }
        if (savedOrders) {
            try {
                const parsed = JSON.parse(savedOrders);
                if (Array.isArray(parsed)) setOrders(parsed);
            } catch (e) {}
        }
        
        setIsLoaded(true);
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('magyarekszer_all_users', JSON.stringify(allUsers));
            localStorage.setItem('magyarekszer_orders', JSON.stringify(orders));
            if (user) {
                localStorage.setItem('magyarekszer_current_user', JSON.stringify(user));
            } else {
                localStorage.removeItem('magyarekszer_current_user');
            }
        }
    }, [user, allUsers, orders, isLoaded]);

    const login = (email: string, password: string) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const register = (userData: User) => {
        if (allUsers.find(u => u.email === userData.email)) return false;
        
        const newUsers = [...allUsers, userData];
        setAllUsers(newUsers);
        setUser(userData);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        setAllUsers(prev => prev.map(u => u.email === userData.email ? userData : u));
    };

    const addOrder = (orderData: Omit<Order, 'id' | 'userId' | 'date' | 'status' | 'viewed'>) => {
        const newOrder: Order = {
            ...orderData,
            id: `ORD-${Date.now()}`,
            userId: user?.email || orderData.customerInfo.email || 'guest',
            date: new Date().toISOString(),
            status: 'pending',
            viewed: false
        };
        
        setOrders(prev => [newOrder, ...prev]);
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status } : order
        ));
    };

    const markOrderAsViewed = (orderId: string) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, viewed: true } : order
        ));
    };

    const userOrders = orders.filter(o => o.userId === user?.email);

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            updateUser, 
            orders: userOrders,
            allOrders: orders,
            allUsers,
            addOrder,
            updateOrderStatus,
            markOrderAsViewed
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
