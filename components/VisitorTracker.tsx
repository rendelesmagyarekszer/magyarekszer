"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface TrafficData {
    totalViews: number;
    uniqueVisits: number;
    daily: Record<string, number>;
    hourly: Record<string, number>;
    pages: Record<string, number>;
    devices: { mobile: number; desktop: number };
    lastUpdated: string;
}

export const getTrafficData = (): TrafficData => {
    if (typeof window === 'undefined') {
        return {
            totalViews: 0,
            uniqueVisits: 0,
            daily: {},
            hourly: {},
            pages: {},
            devices: { mobile: 0, desktop: 0 },
            lastUpdated: ''
        };
    }

    try {
        const raw = localStorage.getItem('magyarekszer_traffic_stats');
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {}

    return {
        totalViews: 0,
        uniqueVisits: 0,
        daily: {},
        hourly: {},
        pages: {},
        devices: { mobile: 0, desktop: 0 },
        lastUpdated: ''
    };
};

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Don't track admin pages as visitor traffic
        if (pathname && pathname.startsWith('/admin')) return;

        try {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const currentHour = new Date().getHours().toString();
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Check session to count unique visitor per session
            const sessionKey = 'magyarekszer_session_active';
            const isNewSession = !sessionStorage.getItem(sessionKey);
            if (isNewSession) {
                sessionStorage.setItem(sessionKey, '1');
            }

            const current = getTrafficData();

            current.totalViews = (current.totalViews || 0) + 1;
            if (isNewSession) {
                current.uniqueVisits = (current.uniqueVisits || 0) + 1;
            }

            // Daily count
            current.daily = current.daily || {};
            current.daily[today] = (current.daily[today] || 0) + 1;

            // Hourly count
            current.hourly = current.hourly || {};
            current.hourly[currentHour] = (current.hourly[currentHour] || 0) + 1;

            // Page count
            const pageKey = pathname || '/';
            current.pages = current.pages || {};
            current.pages[pageKey] = (current.pages[pageKey] || 0) + 1;

            // Device
            current.devices = current.devices || { mobile: 0, desktop: 0 };
            if (isMobile) {
                current.devices.mobile = (current.devices.mobile || 0) + 1;
            } else {
                current.devices.desktop = (current.devices.desktop || 0) + 1;
            }

            current.lastUpdated = new Date().toISOString();

            localStorage.setItem('magyarekszer_traffic_stats', JSON.stringify(current));
        } catch (e) {
            console.error('VisitorTracker error:', e);
        }
    }, [pathname]);

    return null;
}
