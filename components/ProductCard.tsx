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
        ['gyuruk', 'eljegyzesi-es-karikagyuruk', 'eljegyzesi-gyuruk', 'noi-lancok'].includes(product.category);

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
        <div className="premium-card group flex flex-col p-4 h-full">
            {/* Image Container */}
            <div className="aspect-square w-full relative mb-6 overflow-hidden rounded-lg">
                <Link href={`/product/${product.id}`}>
                    <Image 
                        src={product.image} 
                        alt={language === 'EN' && product.nameEn ? product.nameEn : product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
                </Link>
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gold/60 font-bold tracking-wider md:tracking-[0.3em] uppercase truncate max-w-[70%]">
                        {t(`cat_${product.category}`)}
                    </span>
                    <span className="text-[9px] text-ivory/80 font-black uppercase tracking-widest border border-ivory/30 px-2 py-0.5 rounded">
                        Ezüst 925
                    </span>
                </div>
                
                <Link href={`/product/${product.id}`} className="hover:text-gold transition-colors block mb-2">
                    <h3 className="text-lg font-serif text-ivory tracking-wide leading-tight line-clamp-2">
                        {language === 'EN' && product.nameEn ? product.nameEn : product.name}
                    </h3>
                </Link>
                
                {product.isGoldOnly || product.isGoldEngagementRing ? (
                    <p className="text-[11px] md:text-sm font-bold gold-text mb-6 mt-1 uppercase tracking-wider md:tracking-widest text-gold/80 leading-snug">
                        {t('quote_only')}
                    </p>
                ) : (
                    <p className="text-xl font-bold gold-text mb-6">
                        {formatPrice(product.price)}
                    </p>
                )}
                
                <button 
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`
                        mt-auto w-full py-3 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-[0.05em] md:tracking-[0.2em] transition-all flex items-center justify-center gap-2
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
                                className="flex items-center gap-2"
                            >
                                <ArrowRight className="h-3.5 w-3.5 opacity-90" />
                                <span>Választási lehetőségek</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="add"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
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
