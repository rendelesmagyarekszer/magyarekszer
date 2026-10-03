"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop', title: 'Scythian Totem', category: 'Necklace' },
    { src: 'https://images.unsplash.com/photo-1599643484910-a111151963bb?q=80&w=1200&auto=format&fit=crop', title: 'Golden Spirit', category: 'Bracelet' },
    { src: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1200&auto=format&fit=crop', title: 'Eternal Knot', category: 'Ring' },
    { src: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop', title: 'Ancient Guardian', category: 'Pendant' },
    { src: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1200&auto=format&fit=crop', title: 'Workshop Art', category: 'Process' },
    { src: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=1200&auto=format&fit=crop', title: 'Royal Heritage', category: 'Earrings' },
    { src: 'https://images.unsplash.com/photo-1535633302704-b02923cfb8b0?q=80&w=1200&auto=format&fit=crop', title: 'Silver Flow', category: 'Necklace' },
    { src: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop', title: 'Nomadic Gold', category: 'Talisman' },
];

export default function GalleryPage() {
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
            {/* Gallery Sections */}
            <section className="max-w-[1400px] mx-auto px-6 py-24 space-y-32">
                {Array.isArray(customJewelry) && customJewelry.map((category) => (
                    <div key={category.id} className="space-y-16 animate-fade-up">
                        {/* Category Header */}
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.3em] gold-text drop-shadow-lg">
                                {category.title}
                            </h2>
                            <div className="w-24 h-[1px] bg-gold/30 mx-auto"></div>
                            <p className="text-lg md:text-xl text-ivory/80 leading-relaxed font-serif tracking-wide max-w-2xl mx-auto">
                                {category.description}
                            </p>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-1 gap-12">
                            {category.images && Array.isArray(category.images) && category.images.length > 0 ? (
                                category.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`group relative overflow-hidden rounded-2xl premium-card aspect-[4/5] border border-gold/10 hover:border-gold/30 transition-all duration-700 shadow-2xl ${
                                            idx % 4 === 0 ? 'md:col-span-1 lg:col-span-2 lg:aspect-video' : ''
                                        }`}
                                    >
                                        <Image 
                                            src={img.url} 
                                            alt={`${category.title} - ${idx + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-deep-brown via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                                        
                                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100">
                                            <div className="p-4 bg-[#150e03]/60 backdrop-blur-xl rounded-full border border-gold/20 shadow-2xl group-hover:shadow-gold/10">
                                                <Maximize2 className="h-5 w-5 text-gold" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 max-w-[80%]">
                                            <span className="text-gold/80 text-[10px] uppercase tracking-[0.2em] font-black border-l-2 border-gold/60 pl-4 block">
                                                {img.description || "Exkluzív alkotás"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center border border-gold/5 bg-gold/5 rounded-3xl">
                                    <p className="text-gold/80 uppercase tracking-[0.2em] text-xs font-bold">
                                        Hamarosan érkeznek az új fotók erről a különleges kollekcióról...
                                    </p>
                                </div>
                            )}
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
