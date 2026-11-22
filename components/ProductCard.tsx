"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useConfig } from './ConfigProvider';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart, ArrowRight } from 'lucide-react';

import { Product } from '@/lib/data';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { formatPrice, t, language } = useConfig();
    const router = useRouter();
    const [isAdded, setIsAdded] = useState(false);

    // Check if product requires customization
    const requiresCustomization = 
        product.allowsStone || 
        product.isEnamel || 
        product.isKolie || 
        product.isGoldOnly ||
        product.isGoldEngagementRing ||
        product.isLeatherBracelet ||
        ['gyuruk', 'eljegyzesi-es-karikagyuruk', 'eljegyzesi-gyuruk', 'noi-lancok', 'karperecek'].includes(product.category || '');

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (requiresCustomization) {
            router.push(`/product/${product.id}`);
            return;
        }

        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };
    
    return (
        <div className="premium-card group flex flex-col p-3 sm:p-4 h-full">
            {/* Image Container */}
            <div className="aspect-square w-full relative mb-3 sm:mb-6 overflow-hidden rounded-lg bg-[#1a1105]">
                <Link href={`/product/${product.id}`}>
                    <Image 
                        src={product.image} 
                        alt={language === 'EN' && product.nameEn ? product.nameEn : product.name} 
                        fill 
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
                </Link>
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] text-gold/60 font-bold tracking-wider md:tracking-[0.3em] uppercase truncate max-w-[65%] sm:max-w-[70%]">
                        {t(`cat_${product.category}`)}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-ivory/80 font-black uppercase tracking-wider sm:tracking-widest border border-ivory/30 px-1.5 sm:px-2 py-0.5 rounded">
                        Ezüst 925
                    </span>
                </div>
                
                <Link href={`/product/${product.id}`} className="hover:text-gold transition-colors block mb-1.5 sm:mb-2">
                    <h3 className="text-xs sm:text-base md:text-lg font-serif text-ivory tracking-wide leading-snug line-clamp-2 min-h-[2.4em]">
                        {language === 'EN' && product.nameEn ? product.nameEn : product.name}
                    </h3>
                </Link>
                
                {product.isGoldOnly || product.isGoldEngagementRing ? (
                    <p className="text-[10px] sm:text-sm font-bold gold-text mb-3 sm:mb-6 mt-1 uppercase tracking-wider md:tracking-widest text-gold/80 leading-snug">
                        {t('quote_only')}
                    </p>
                ) : (
                    <p className="text-base sm:text-xl font-bold gold-text mb-3 sm:mb-6">
                        {formatPrice(product.price)}
                    </p>
                )}
                
                <button 
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`
                        mt-auto w-full py-2.5 sm:py-3 rounded-md text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.05em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 sm:gap-2
                        ${isAdded 
                            ? "bg-gold text-deep-brown" 
                            : "bg-ivory/5 border border-gold/30 text-gold hover:bg-gold hover:text-deep-brown"}
                    `}
                >
                    <AnimatePresence mode="wait">
                        {isAdded ? (
                            <motion.div
                                key="added"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2"
                            >
                                <Check className="h-3.5 w-3.5 shadow-sm" />
                                <span>{t('added')}</span>
                            </motion.div>
                        ) : requiresCustomization ? (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-1.5 sm:gap-2"
                            >
                                <ArrowRight className="h-3.5 w-3.5 opacity-90" />
                                <span className="hidden sm:inline">Választási lehetőségek</span>
                                <span className="sm:hidden">Megnézem</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="add"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-1.5 sm:gap-2"
                            >
                                <ShoppingCart className="h-3.5 w-3.5 opacity-90" />
                                <span>{t('add_to_cart')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
