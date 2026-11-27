"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useCart } from './CartProvider';
import { useConfig } from './ConfigProvider';

export default function AddToCartToast() {
    const { lastAddedItem, dismissLastAdded, cartItems } = useCart();
    const { formatPrice, language } = useConfig();

    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <AnimatePresence>
            {lastAddedItem && (
                <motion.div
                    key={lastAddedItem.timestamp}
                    initial={{ opacity: 0, y: -24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="fixed top-24 sm:top-28 inset-x-3 sm:left-auto sm:right-6 sm:w-[390px] z-[90] pointer-events-auto"
                    role="status"
                    aria-live="polite"
                >
                    <div className="bg-[#1b1206]/95 backdrop-blur-xl border-2 border-[#c9a56a] rounded-2xl p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_28px_rgba(201,165,106,0.28)] space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#c9a56a]/20 pb-3">
                            <div className="flex items-center gap-2 text-emerald-300">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-[0.22em]">
                                    {language === 'EN' ? 'Added to Cart!' : 'Kosárba téve!'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={dismissLastAdded}
                                aria-label="Bezárás"
                                className="p-1 text-ivory/50 hover:text-gold transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Product Summary */}
                        <div className="flex items-center gap-3.5">
                            {lastAddedItem.product.image && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#c9a56a]/50 bg-black shrink-0 shadow-md">
                                    <img
                                        src={lastAddedItem.product.image}
                                        alt={lastAddedItem.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm sm:text-base font-serif font-bold text-[#fdfdf3] leading-snug line-clamp-2">
                                    {language === 'EN' && lastAddedItem.product.nameEn
                                        ? lastAddedItem.product.nameEn
                                        : lastAddedItem.product.name}
                                </p>
                                {lastAddedItem.customization && (
                                    <p className="text-[11px] text-[#f1d592]/90 italic line-clamp-2">
                                        {lastAddedItem.customization}
                                    </p>
                                )}
                                <p className="text-sm font-black text-[#c9a56a]">
                                    {formatPrice(lastAddedItem.product.price)}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={dismissLastAdded}
                                className="py-2.5 px-3 rounded-xl border border-[#c9a56a]/35 text-[#fdfdf3]/80 hover:text-[#fdfdf3] hover:border-[#c9a56a] text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                {language === 'EN' ? 'Continue' : 'Vásárlás folytatása'}
                            </button>
                            <Link
                                href="/cart"
                                onClick={dismissLastAdded}
                                className="py-2.5 px-3 rounded-xl bg-[#c9a56a] hover:bg-[#d8b67b] text-[#150e03] text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all"
                            >
                                <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                    {language === 'EN' ? `Cart (${totalCount})` : `Kosár (${totalCount})`}
                                </span>
                                <ArrowRight className="h-3 w-3 shrink-0" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
