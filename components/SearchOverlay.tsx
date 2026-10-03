"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearch } from './SearchProvider';
import { useConfig } from './ConfigProvider';
import Link from 'next/link';
import Image from 'next/image';

const SearchOverlay = () => {
    const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen } = useSearch();
    const { t, formatPrice, products, collections } = useConfig();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when overhead opens
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSearchOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsSearchOpen]);

    const filteredProducts = searchQuery.trim() === "" 
        ? [] 
        : products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const descMatch = p.description.toLowerCase().includes(searchQuery.toLowerCase());
            const skuMatch = p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Check collection name match
            const collection = collections.find(c => c.id === p.collectionId);
            const collectionMatch = collection?.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return nameMatch || descMatch || skuMatch || collectionMatch;
        }).slice(0, 6);

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-24 px-4 bg-[#150e03]/95 backdrop-blur-xl"
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-8 right-8 p-3 text-[#c9a56a]/60 hover:text-[#fdfdf3] transition-colors rounded-full border border-[#c9a56a]/20 hover:border-[#c9a56a]/60"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="w-full max-w-3xl flex flex-col space-y-12">
                        {/* Search Input Section */}
                        <div className="relative group">
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a56a] to-transparent opacity-50"
                            ></motion.div>
                            
                            <div className="flex items-center space-x-6">
                                <Search className="h-8 w-8 text-[#c9a56a]" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none text-3xl md:text-5xl font-serif text-[#fdfdf3] placeholder-[#c9a56a]/30 outline-none pb-2 decoration-none"
                                />
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link 
                                            href={`/product/${product.id}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="group flex items-center space-x-4 p-3 rounded-lg bg-[#1e1405]/40 border border-[#c9a56a]/10 hover:border-[#c9a56a]/40 transition-all hover:bg-[#1e1405]"
                                        >
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-[#c9a56a]/20">
                                                <Image 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[#fdfdf3] font-serif text-lg truncate group-hover:text-[#c9a56a] transition-colors">{product.name}</h3>
                                                <p className="text-[#999999] text-sm uppercase tracking-widest mb-1 italic opacity-60">{product.sku}</p>
                                                <p className="text-[#c9a56a] font-bold text-sm tracking-widest">{formatPrice(product.price)}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-[#c9a56a]/0 -translate-x-2 transition-all group-hover:text-[#c9a56a]/60 group-hover:translate-x-0" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {searchQuery.trim() !== "" && filteredProducts.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-10 text-center"
                                >
                                    <p className="text-[#c9a56a]/60 italic font-serif text-xl">{t('no_results')}</p>
                                </motion.div>
                            )}

                            {searchQuery.trim() === "" && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30 grayscale pointer-events-none">
                                    <Search className="h-20 w-20 text-[#c9a56a] mb-4" />
                                    <p className="text-[#c9a56a] uppercase tracking-[0.5em] text-xs font-black italic">{t('look_around')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
