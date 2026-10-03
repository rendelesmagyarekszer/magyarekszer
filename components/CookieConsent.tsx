"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const consent = localStorage.getItem('magyarekszer_cookie_consent');
        if (!consent) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('magyarekszer_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-8"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-[#1a140a]/95 backdrop-blur-md border border-[#c9a56a]/20 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="bg-[#c9a56a]/10 p-3 rounded-full border border-[#c9a56a]/10 hidden sm:block">
                                    <Cookie className="h-6 w-6 text-[#c9a56a]" />
                                </div>
                                <div className="space-y-1 text-center md:text-left">
                                    <h4 className="text-sm font-serif uppercase tracking-[0.2em] text-[#c9a56a] italic">Süti Tájékoztató</h4>
                                    <p className="text-sm text-[#999999] max-w-2xl leading-relaxed font-serif">
                                        Weboldalunk sütiket használ a felhasználói élmény fokozása és a zavartalan működés érdekében. 
                                        A gombra kattintással elfogadja a sütik használatát, amelyről részletesen olvashat az 
                                        <Link href="/privacy" className="text-[#c9a56a] hover:underline ml-1">Adatvédelmi Nyilatkozatunkban</Link>.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none bg-[#c9a56a] text-[#150e03] px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#b08d55] transition-all whitespace-nowrap shadow-lg shadow-[#c9a56a]/10"
                                >
                                    Elfogadom
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-4 text-[#666666] hover:text-[#c9a56a] transition-colors"
                                    aria-label="Bezárás"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
