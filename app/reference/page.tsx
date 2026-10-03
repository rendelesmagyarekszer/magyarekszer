"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Star } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function ReferencePage() {
    const { t, customJewelry, isLoaded } = useConfig();

    if (!isLoaded) {
        return (
            <main className="min-h-screen bg-[#150e03] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] pt-32 pb-24 font-serif">
            {/* Page Header */}
            <section className="max-w-4xl mx-auto px-6 pt-12 text-center space-y-8 animate-fade-up">
                <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.3em] text-gold">
                    {t('reference')}
                </h1>
                <div className="w-24 h-[1px] bg-gold/30 mx-auto"></div>
                <p className="text-sm md:text-base text-ivory/60 leading-relaxed font-serif tracking-wide max-w-2xl mx-auto">
                    {t('page_reference_content')}
                </p>
            </section>

            {/* Gallery Sections */}
            <section className="max-w-[1400px] mx-auto px-6 py-20 space-y-32">

                {Array.isArray(customJewelry) && customJewelry.map((category) => (
                    <div key={category.id} className="space-y-16 animate-fade-up">
                        {/* Category Header */}
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-[0.3em] text-ivory/90">
                                {category.title}
                            </h2>
                            <div className="w-16 h-[1px] bg-gold/20 mx-auto"></div>
                            <p className="text-sm md:text-base text-ivory/40 leading-relaxed font-serif tracking-wide max-w-xl mx-auto">
                                {category.description}
                            </p>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {category.images && Array.isArray(category.images) && category.images.length > 0 ? (
                                category.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className="group relative overflow-hidden rounded-xl premium-card aspect-[4/5] border border-gold/5 hover:border-gold/20 transition-all duration-700 shadow-xl"
                                    >
                                        <Image 
                                            src={img.url} 
                                            alt={`${category.title} - ${idx + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                                        
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100">
                                            <div className="p-3 bg-[#150e03]/60 backdrop-blur-xl rounded-full border border-gold/20 shadow-xl">
                                                <Maximize2 className="h-4 w-4 text-gold" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="text-gold/90 text-[10px] uppercase tracking-[0.2em] font-black border-l-2 border-gold/60 pl-4 block leading-relaxed">
                                                {img.description || "Referencia alkotás"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : null}
                        </div>
                    </div>
                ))}

                {/* Return Home */}
                <div className="mt-32 pt-20 border-t border-gold/10 flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-6 text-gold/60 hover:text-gold transition-all group px-10 py-5 border border-gold/10 hover:border-gold/30 rounded-full hover:bg-gold/5 shadow-lg">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">{t('back_to_home')}</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
