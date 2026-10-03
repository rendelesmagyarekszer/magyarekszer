"use client";

import React, { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import HomeCategoryRow from '@/components/HomeCategoryRow';
import { useConfig } from '@/components/ConfigProvider';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface CategoryClientProps {
    slug: string;
}

export default function CategoryClient({ slug }: CategoryClientProps) {
    const { t, products } = useConfig();
    const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');

    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter(product => {
            if (slug === 'zomanc') {
                return product.isEnamel === true;
            }
            return product.category === slug;
        });
        
        if (sortBy === 'asc') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'desc') {
            result = [...result].sort((a, b) => b.price - a.price);
        }
        
        return result;
    }, [slug, sortBy, products]);

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3]">
            <div className="bg-[#0d0902] py-4 border-b border-[#c9a56a]/5">
                <div className="max-w-[1400px] mx-auto px-4 flex items-center text-[9px] uppercase tracking-[0.2em] text-[#666666] font-bold">
                    <Link href="/" className="hover:text-[#c9a56a] transition-colors font-black">{t('home')}</Link>
                    <ChevronRight className="h-2 w-2 mx-3 text-[#3d2b1f]" />
                    <span className="text-[#c9a56a] font-black">{t(`cat_${slug}`)}</span>
                </div>
            </div>

            <div className="bg-[#150e03] py-4">
                <HomeCategoryRow />
            </div>
            
            <div className="max-w-[1400px] mx-auto px-4 py-8">
                <div className="flex flex-col gap-2">
                    <div className="flex-1">
                        <div className="flex justify-end mb-8 border-b border-[#c9a56a]/10 pb-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#666666] font-black">{t('sorting')}</span>
                                <div className="relative group">
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-[#0d0902] border border-[#c9a56a]/20 text-[#fdfdf3] py-2 px-6 pr-12 text-[10px] uppercase tracking-[0.1em] font-black outline-none focus:border-[#c9a56a] cursor-pointer appearance-none hover:bg-[#150e03] transition-colors"
                                    >
                                        <option value="none">{t('default_sort')}</option>
                                        <option value="asc">{t('price_asc')}</option>
                                        <option value="desc">{t('price_desc')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-2.5 h-3.5 w-3.5 text-[#c9a56a] pointer-events-none opacity-60" />
                                </div>
                            </div>
                        </div>
                        
                        {filteredAndSortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex justify-center py-40">
                                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="text-center py-40 border border-[#c9a56a]/10 bg-[#2D3419]/20 backdrop-blur-sm shadow-2xl">
                                <p className="text-[#c9a56a] font-serif italic text-lg uppercase tracking-[0.2em] opacity-80">
                                    {t('coming_soon')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
