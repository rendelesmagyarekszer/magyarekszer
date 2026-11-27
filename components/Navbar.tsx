"use client";

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Globe, Coins, User, Menu, X, Sparkles, Copy, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSearch } from './SearchProvider';
import { useCart } from './CartProvider';
import { useConfig } from './ConfigProvider';
import { useAuth } from './AuthProvider';
import { categories as allCategories } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTabs from './InfoTabs';

import SearchOverlay from './SearchOverlay';

const Navbar = () => {
    const { cartItems } = useCart();
    const { currency, setCurrency, language, setLanguage, t, vacationMode, coupons, formatPrice } = useConfig();
    const { setIsSearchOpen } = useSearch();
    const { user } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
    
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Find currently active, non-expired, already-started coupons
    const activeCoupons = React.useMemo(() => {
        const now = new Date();
        return (coupons || []).filter((c) => {
            if (!c.isActive) return false;
            if (c.startDate && new Date(`${c.startDate}T00:00:00`) > now) return false;
            if (c.expiryDate && new Date(`${c.expiryDate}T23:59:59`) < now) return false;
            return true;
        });
    }, [coupons]);

    const handleCopyCoupon = (code: string) => {
        try {
            navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (e) {}
    };

    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <>
            <header className="glass-nav fixed w-full top-0 z-50">
                {/* Free Shipping Announcement Banner */}
                <div className="w-full bg-[#1c1305]/95 backdrop-blur-md text-[#d4af37] border-b border-[#c9a56a]/20 py-2 px-3 text-center text-xs sm:text-[13px] font-serif tracking-[0.15em] sm:tracking-[0.22em] flex items-center justify-center shadow-sm">
                    <span>{t('free_shipping_banner')}</span>
                </div>

                {/* Active Coupon Banner (only shown when at least one coupon is live) */}
                {!isAdminRoute && activeCoupons.length > 0 && (
                    <div className="w-full bg-gradient-to-r from-[#211606] via-[#34230a] to-[#211606] border-b border-[#c9a56a]/45 py-2.5 px-3 shadow-md">
                        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-serif text-[#fdfdf3]">
                            {activeCoupons.map((coupon) => {
                                const discountLabel = coupon.discountType === 'percentage'
                                    ? `${coupon.value}% kedvezmény`
                                    : `${formatPrice(coupon.value)} kedvezmény`;
                                const categoryNames = (coupon.categories && coupon.categories.length > 0)
                                    ? coupon.categories
                                        .map((slug) => allCategories.find((cat) => cat.slug === slug)?.name || slug)
                                        .join(', ')
                                    : null;
                                const isCopied = copiedCode === coupon.code;
                                return (
                                    <div key={coupon.code} className="flex flex-wrap items-center justify-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 text-[#f1d592] tracking-[0.1em]">
                                            <Sparkles className="h-4 w-4 text-[#c9a56a] shrink-0" />
                                            <strong className="font-semibold text-[#fdfdf3]">{discountLabel}</strong>
                                            {categoryNames && (
                                                <span className="text-[#c9a56a]/90 text-[11px] sm:text-xs">({categoryNames})</span>
                                            )}
                                        </span>
                                        <span className="text-[#c9a56a]/60 hidden sm:inline">•</span>
                                        <span className="text-xs sm:text-[13px] text-ivory/85 tracking-wider">Kuponkód:</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyCoupon(coupon.code)}
                                            title="Kattints a kuponkód másolásához"
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a56a]/20 hover:bg-[#c9a56a]/35 border border-[#c9a56a]/70 text-[#f5d593] font-sans text-xs sm:text-[13px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
                                        >
                                            <span>{coupon.code}</span>
                                            {isCopied ? (
                                                <span className="inline-flex items-center gap-0.5 text-emerald-300 tracking-normal font-bold normal-case">
                                                    <Check className="h-3.5 w-3.5" /> Másolva
                                                </span>
                                            ) : (
                                                <Copy className="h-3.5 w-3.5 opacity-75" />
                                            )}
                                        </button>
                                        {coupon.expiryDate && (
                                            <span className="text-[11px] sm:text-xs text-[#c9a56a]/80 italic hidden md:inline">
                                                ({coupon.expiryDate}-ig)
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {vacationMode?.isActive && (
                    <div className="w-full bg-red-950/90 text-ivory/90 text-center py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black shadow-lg border-b border-red-500/20">
                        {t('vacation_banner_text').replace('{date}', vacationMode.returnDate || '')}
                    </div>
                )}
                <nav className="py-3 sm:py-4 px-3 sm:px-6 md:px-12 flex items-center justify-between relative">
                    {/* Left: Hamburger (Mobile) & Selectors (Desktop) */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                        <button 
                            className="md:hidden p-2 text-gold/80 hover:text-gold transition-colors z-[60]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        
                        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-medium">
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <Globe className="h-3.5 w-3.5 text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
                                <select 
                                    value={language} 
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="bg-transparent border-none outline-none cursor-pointer hover:text-gold transition-colors"
                                >
                                    <option value="HU" className="bg-deep-brown text-ivory">HU</option>
                                    <option value="EN" className="bg-deep-brown text-ivory">EN</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 -translate-x-1/2 max-w-[45%] sm:max-w-[60%] md:max-w-none text-center pointer-events-auto">
                        <Link href="/" className="group flex flex-col items-center">
                            {pathname === '/' ? (
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 -my-2 opacity-90 group-hover:opacity-100 transition-opacity bg-[#150e03] rounded-lg overflow-hidden flex items-center justify-center">
                                    <Image 
                                        src="/logo-white.png" 
                                        alt="MagyarÉkszer Logo" 
                                        fill 
                                        className="object-contain p-1" 
                                        priority 
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-xs sm:text-lg md:text-2xl font-serif tracking-[0.15em] sm:tracking-[0.4em] md:tracking-[0.5em] uppercase gold-text group-hover:scale-105 transition-transform duration-500 truncate whitespace-nowrap">
                                        MAGYARÉKSZER
                                    </h1>
                                    <span className="text-[7px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.3em] text-gold/60 mt-0.5 sm:mt-1 group-hover:text-gold/80 transition-colors font-bold whitespace-nowrap">
                                        {t('tradition')}
                                    </span>
                                    <div className="w-4 sm:w-8 h-[1px] bg-gold/40 mt-1 sm:mt-2 group-hover:w-16 transition-all duration-500"></div>
                                </>
                            )}
                        </Link>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-4 md:gap-8">
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="group flex items-center gap-2 p-2 sm:px-4 sm:py-2 border border-gold/10 rounded-full hover:border-gold/40 hover:bg-gold/5 transition-all duration-500 shadow-sm hover:shadow-[0_0_15px_rgba(201,165,106,0.1)]"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4 text-gold/60 group-hover:text-gold transition-colors" />
                            <span className="hidden md:block text-[11px] uppercase tracking-[0.2em] font-black text-gold/60 group-hover:text-gold transition-colors">
                                {t('search_label')}
                            </span>
                        </button>

                        <Link href="/account" className="p-1.5 sm:p-2 hover:text-gold transition-colors" aria-label={t('account')}>
                            <User className="h-5 w-5" />
                        </Link>

                        <Link href="/cart" className="p-1.5 sm:p-2 hover:text-gold transition-colors relative" aria-label={t('cart')}>
                            <ShoppingCart className="h-5 w-5" />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute -top-1 -right-1 bg-gold text-deep-brown text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                </nav>

                <div className="border-t border-gold/5 bg-[#150e03]/10">
                    <InfoTabs />
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-gold/10 bg-[#150e03]/95 backdrop-blur-xl overflow-hidden"
                        >
                            <div className="p-6 flex flex-col gap-6">
                                <Link 
                                    href="/account" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-black uppercase tracking-[0.2em] text-ivory/80 hover:text-gold flex items-center gap-3"
                                >
                                    <User className="h-4 w-4" />
                                    {t('account')}
                                </Link>
                                
                                <div className="h-[1px] w-full bg-gold/10"></div>
                                
                                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-ivory/80">
                                    <Globe className="h-4 w-4" />
                                    Nyelv:
                                    <select 
                                        value={language} 
                                        onChange={(e) => {
                                            setLanguage(e.target.value as any);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="bg-transparent border-none outline-none cursor-pointer text-gold ml-2"
                                    >
                                        <option value="HU" className="bg-deep-brown">HU (Magyar)</option>
                                        <option value="EN" className="bg-deep-brown">EN (English)</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
            <SearchOverlay />
        </>
    );
};

export default Navbar;
