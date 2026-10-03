"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Utensils, X } from 'lucide-react';

const LunchBreakPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // 10:00 (600 mins) to 12:30 (750 mins)
            const shouldBeVisible = totalMinutes >= 600 && totalMinutes <= 750;
            
            if (shouldBeVisible && !isDismissed) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Check every minute
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [isDismissed]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-8 right-8 z-[100] max-w-sm w-full"
                >
                    <div className="bg-[#150e03] border border-gold/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Decorative Top Border */}
                        <div className="h-1 w-full bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0"></div>
                        
                        <div className="p-6 relative">
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsDismissed(true)}
                                className="absolute top-4 right-4 text-gold/40 hover:text-gold transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="bg-gold/10 p-3 rounded-xl border border-gold/20 group animate-pulse">
                                    <Utensils className="h-6 w-6 text-gold" />
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-gold font-serif text-sm uppercase tracking-[0.2em] font-black">
                                        Ebédszünet Értesítés
                                    </h3>
                                    <p className="text-ivory/70 text-xs leading-relaxed font-medium">
                                        Tájékoztatjuk kedves vásárlóinkat, hogy <span className="text-gold">12:00 és 12:30 között</span> ebédszünetet tartunk. 
                                        Ez idő alatt telefonos elérhetőségünk is szünetel.
                                    </p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Clock className="h-3 w-3 text-gold/40" />
                                        <span className="text-[10px] text-gold/40 uppercase tracking-widest font-black">Köszönjük türelmét!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LunchBreakPopup;
