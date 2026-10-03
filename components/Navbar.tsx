"use client";

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Globe, Coins, User, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSearch } from './SearchProvider';
import { useCart } from './CartProvider';
import { useConfig } from './ConfigProvider';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTabs from './InfoTabs';

import SearchOverlay from './SearchOverlay';

const Navbar = () => {
    const { cartItems } = useCart();
    const { currency, setCurrency, language, setLanguage, t, vacationMode } = useConfig();
    const { setIsSearchOpen } = useSearch();
    const { user } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <header className="glass-nav fixed w-full top-0 z-50">
                {vacationMode?.isActive && (
                    <div className="w-full bg-red-950/90 text-ivory/90 text-center py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black shadow-lg border-b border-red-500/20">
                        {t('vacation_banner_text').replace('{date}', vacationMode.returnDate || '')}
                    </div>
                )}
                <nav className="py-4 px-6 md:px-12 flex items-center justify-between relative">
                    {/* Left: Hamburger (Mobile) & Selectors (Desktop) */}
                    <div className="flex items-center gap-4 md:gap-8">
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
                    <div className="absolute left-1/2 -translate-x-1/2 max-w-[50%] flex justify-center">
                        <Link href="/" className="group flex flex-col items-center text-center">
                            {pathname === '/' ? (
                                <div className="relative w-12 h-12 md:w-16 md:h-16 opacity-90 group-hover:opacity-100 transition-opacity rounded-full overflow-hidden flex items-center justify-center border border-gold/30 shadow-md bg-[#150e03]">
                                    <Image 
                                        src="/logo.jpg" 
                                        alt="MagyarÉkszer Logo" 
                                        fill 
                                        className="object-cover" 
                                        priority 
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-base sm:text-lg md:text-2xl font-serif tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] uppercase gold-text group-hover:scale-105 transition-transform duration-500 truncate max-w-full">
                                        MAGYARÉKSZER
                                    </h1>
                                    <span className="hidden sm:block text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-gold/60 mt-0.5 group-hover:text-gold/80 transition-colors font-bold">
                                        {t('tradition')}
                                    </span>
                                    <div className="w-6 md:w-8 h-[1px] bg-gold/40 mt-1 group-hover:w-12 transition-all duration-500"></div>
                                </>
                            )}
                        </Link>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-3 md:gap-8 z-10">
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="group flex items-center gap-2 p-2 md:px-4 md:py-2 border border-gold/10 rounded-full hover:border-gold/40 hover:bg-gold/5 transition-all duration-500 shadow-sm hover:shadow-[0_0_15px_rgba(201,165,106,0.1)]"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4 text-gold/80 group-hover:text-gold transition-colors shrink-0" />
                            <span className="hidden md:block text-[11px] uppercase tracking-[0.2em] font-black text-gold/60 group-hover:text-gold transition-colors">
                                {t('search_label')}
                            </span>
                        </button>

                        <Link href="/account" className="p-1.5 sm:p-2 hover:text-gold transition-colors" aria-label={t('account')}>
                            <User className="h-5 w-5 text-gold/80 hover:text-gold" />
                        </Link>

                        <Link href="/cart" className="p-1.5 sm:p-2 hover:text-gold transition-colors relative" aria-label={t('cart')}>
                            <ShoppingCart className="h-5 w-5 text-gold/80 hover:text-gold" />
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
