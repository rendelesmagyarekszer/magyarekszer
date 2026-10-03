"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { categories } from '@/lib/data';
import { useParams } from 'next/navigation';
import { useConfig } from '@/components/ConfigProvider';
import { motion } from 'framer-motion';

const HomeCategoryRow = () => {
    const { slug } = useParams();
    const { t, imageSettings, updateImageSetting } = useConfig();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Listen for storage changes from other tabs (e.g. admin saving images)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'magyarekszer_image_settings' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    Object.entries(parsed).forEach(([key, value]) => {
                        updateImageSetting(key, value as string);
                    });
                } catch {}
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="w-full h-full">
            <div className="flex justify-between items-center gap-1 sm:gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((category) => {
                    const isActive = slug === category.slug;
                    const isAnyActive = !!slug;
                    const isDimmed = isAnyActive && !isActive;
                    // Only apply custom image after client hydration to avoid mismatch
                    const customImage = mounted ? imageSettings?.[`cat_${category.slug}`] : undefined;
                    const finalImage = customImage || category.image;
                    
                    return (
                        <Link 
                            key={category.slug} 
                            href={`/category/${category.slug}`}
                            className="flex flex-col items-center group flex-shrink-0 sm:flex-1 min-w-[70px] sm:min-w-0"
                        >
                            <div className={`relative aspect-square w-full max-w-[80px] md:max-w-[100px] overflow-hidden rounded-md border transition-all duration-700 mb-3 ${isActive ? 'border-gold shadow-[0_0_20px_rgba(201,165,106,0.3)]' : 'border-gold/10 group-hover:border-gold/50'}`}>
                                <img
                                    src={finalImage}
                                    alt={t(`cat_${category.slug}`)}
                                    className={`object-cover transition-opacity duration-700 ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                                    style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }}
                                />
                                <div className={`absolute inset-0 bg-deep-brown transition-all duration-700 ${isDimmed ? 'opacity-40' : 'opacity-0 group-hover:opacity-0'}`}></div>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 h-8">
                                <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-center font-bold leading-tight transition-all duration-500 ${isActive ? 'text-gold scale-110' : (isDimmed ? 'text-ivory/20 group-hover:text-gold' : 'text-ivory/80 group-hover:text-gold')}`}>
                                    {t(`cat_${category.slug}`)}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="category-dot"
                                        className="w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_#c9a56a]"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default HomeCategoryRow;
