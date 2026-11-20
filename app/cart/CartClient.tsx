"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft } from 'lucide-react';

export default function CartClient() {
    const { cartItems, removeFromCart, totalAmount, baseTotal, discountAmount, addToCart } = useCart();
    const { formatPrice, t, shippingSettings } = useConfig();

    const freeShippingThreshold = shippingSettings?.freeShippingThreshold ?? 20000;
    const isFreeShipping = (shippingSettings?.freeShippingEnabled !== false) && (totalAmount >= freeShippingThreshold);
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalAmount);
    const progressPercent = Math.min(100, Math.round((totalAmount / freeShippingThreshold) * 100));

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#150e03]">
                <div className="bg-[#2D3419]/50 p-8 rounded-full mb-8 border border-[#c9a56a]/10">
                    <ShoppingBag className="h-10 w-10 text-[#c9a56a]/40" />
                </div>
                <h2 className="text-xl font-serif text-[#fdfdf3] mb-4 uppercase tracking-widest">{t('empty_cart')}</h2>
                <p className="text-[#999999] mb-12 text-sm italic font-serif">{t('look_around')}</p>
                <Link 
                    href="/" 
                    className="bg-[#c9a56a] text-[#150e03] px-10 py-4 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#b08d55] transition-all"
                >
                    {t('back_to_products')}
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-8 sm:py-20 px-3 sm:px-4">
            <div className="max-w-[1200px] mx-auto">
                <Link href="/" className="flex items-center text-[10px] text-[#999999] hover:text-[#c9a56a] mb-6 sm:mb-12 transition-colors uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold">
                    <ChevronLeft className="h-3 w-3 mr-2" />
                    {t('back_to_catalog')}
                </Link>

                <h1 className="text-2xl sm:text-3xl font-serif text-[#fdfdf3] mb-8 sm:mb-16 border-b border-[#c9a56a]/20 pb-6 sm:pb-10 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center">
                    {t('cart_title_hu')} <span className="text-[#c9a56a]">{t('cart_subtitle_hu')}</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20">
                    <div className="flex-1 space-y-4 sm:space-y-8">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-8 p-4 sm:p-8 md:p-10 border border-[#c9a56a]/10 hover:border-[#c9a56a]/30 transition-all bg-[#2D3419]/30 rounded-xl">
                                <div className="flex items-center gap-4 sm:block">
                                    <div className="relative h-20 w-20 sm:h-32 sm:w-32 flex-shrink-0 border border-[#c9a56a]/10 overflow-hidden rounded-lg">
                                        <Image 
                                            src={item.image} 
                                            alt={item.name} 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="sm:hidden flex-1 min-w-0">
                                        <h3 className="font-serif text-base text-[#fdfdf3] uppercase tracking-wide truncate">{item.name}</h3>
                                        <p className="font-bold text-[#c9a56a] tracking-widest text-base mt-1">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="hidden sm:flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif text-[18px] text-[#fdfdf3] mb-2 uppercase tracking-wide">{item.name}</h3>
                                            <p className="text-[10px] text-[#666666] font-bold tracking-widest uppercase mb-1">{t(`cat_${item.category}`)}</p>
                                            {item.selectedCustomization && (
                                                <p className="text-[14px] md:text-[16px] text-[#c9a56a] font-serif tracking-wide mt-2">{item.selectedCustomization}</p>
                                            )}
                                        </div>
                                        <p className="font-bold text-[#c9a56a] tracking-widest text-[16px]">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>

                                    {item.selectedCustomization && (
                                        <p className="sm:hidden text-xs text-[#c9a56a] font-serif tracking-wide mt-1">{item.selectedCustomization}</p>
                                    )}
                                    
                                    <div className="flex justify-between items-center mt-4 sm:mt-12 pt-3 sm:pt-0 border-t border-[#c9a56a]/10 sm:border-0">
                                        <div className="flex items-center border border-[#c9a56a]/20 px-2 sm:px-3 py-1 sm:py-2 bg-[#150e03] rounded-lg">
                                            <button 
                                                onClick={() => removeFromCart(item.id, item.selectedCustomization)}
                                                className="p-1 text-[#666666] hover:text-[#c9a56a]"
                                            >
                                                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                            <span className="mx-4 sm:mx-6 font-bold text-xs w-5 sm:w-6 text-center text-[#fdfdf3]">{item.quantity}</span>
                                            <button 
                                                onClick={() => addToCart(item, item.selectedCustomization)}
                                                className="p-1 text-[#666666] hover:text-[#c9a56a]"
                                            >
                                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => removeFromCart(item.id, item.selectedCustomization)}
                                            className="text-[#666666] hover:text-red-400 transition-colors p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-3 text-[10px] uppercase tracking-widest font-black"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span>{t('delete')}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full lg:w-96">
                        <div className="bg-[#2D3419]/40 p-5 sm:p-8 md:p-12 border border-[#c9a56a]/10 sticky top-24 backdrop-blur-md rounded-xl">
                            {/* Free Shipping Progress Card */}
                            <div className={`p-4 rounded-xl border mb-8 transition-all ${
                                isFreeShipping 
                                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                                    : 'bg-[#150e03]/90 border-[#c9a56a]/20 text-[#fdfdf3]'
                            }`}>
                                {isFreeShipping ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎉</span>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                                {t('free_shipping_reached')}
                                            </p>
                                            <p className="text-[10px] text-emerald-400/80 font-serif italic mt-0.5">
                                                A belföldi kiszállítás díjtalan a csomagodhoz!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-ivory/85 font-serif italic">
                                                {t('free_shipping_remaining').replace('{amount}', formatPrice(remainingForFreeShipping))}
                                            </span>
                                            <span className="text-[10px] text-[#c9a56a] font-bold font-mono">{progressPercent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#c9a56a]/15">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#b08d55] to-[#e6ca85] rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-[#888888] font-serif italic text-center">
                                            20 000 Ft feletti rendelés esetén a házhozszállítás ajándék! 🎁
                                        </p>
                                    </div>
                                )}
                            </div>

                            <h2 className="font-serif text-xl mb-10 text-[#fdfdf3] uppercase tracking-widest border-b border-[#c9a56a]/10 pb-6 text-center italic">{t('order_summary')}</h2>
                            
                            <div className="space-y-8 text-[11px] mb-12 uppercase tracking-[0.2em] font-bold text-[#999999]">
                                <div className="flex justify-between">
                                    <span>{t('subtotal')}</span>
                                    <span className="text-[#fdfdf3]">{formatPrice(baseTotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-[#c9a56a]">
                                        <span>Csomagkedvezmény (Kollekció)</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>{t('shipping')}</span>
                                    <span>
                                        {isFreeShipping ? (
                                            <span className="text-emerald-400 font-bold tracking-wider">{t('free_label') || 'INGYENES'}</span>
                                        ) : (
                                            <span className="text-ivory/40 lowercase italic text-[10px]">pénztárnál</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-[#c9a56a]/10 pt-10 text-[18px] font-black text-[#fdfdf3] tracking-[0.1em]">
                                    <span>{t('total')}</span>
                                    <span className="text-[#c9a56a]">{formatPrice(totalAmount)}</span>
                                </div>
                            </div>

                            <Link 
                                href="/checkout"
                                className="flex items-center justify-center w-full bg-[#c9a56a] text-[#150e03] py-5 font-black tracking-[0.4em] uppercase text-[11px] hover:bg-[#b08d55] transition-all group shadow-2xl"
                            >
                                {t('go_to_checkout')}
                                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <p className="mt-12 text-[9px] text-[#555555] text-center leading-loose uppercase tracking-[0.3em] border-t border-[#c9a56a]/5 pt-8 font-bold">
                                {t('workshop_security')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
