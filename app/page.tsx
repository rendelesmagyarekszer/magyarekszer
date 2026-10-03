"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HomeCategoryRow from '@/components/HomeCategoryRow';
import InfoTabs from '@/components/InfoTabs';
import { useConfig } from '@/components/ConfigProvider';

export default function Home() {
    const { t } = useConfig();
    
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "JewelryStore",
        "name": "MagyarÉkszer",
        "image": "https://magyarekszer.hu/logo.jpg",
        "description": "Kiváló minőségű, kézzel készült Szkíta, Hun és Magyar tradicionális ékszerek, talizmánok és viseletkiegészítők.",
        "url": "https://magyarekszer.hu",
        "telephone": "+36302111111",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Márton u. 1.",
            "addressLocality": "Budapest",
            "postalCode": "1000",
            "addressCountry": "HU"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 47.497912,
            "longitude": 19.040235
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ],
            "opens": "09:00",
            "closes": "17:00"
        }
    };

    return (
        <div className="flex flex-col w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
                {/* Background with parallax-like effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-deep-brown via-transparent to-deep-brown"></div>
                </div>

                {/* Central Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-up pb-32">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-[0.2em] uppercase mb-4 drop-shadow-2xl gold-text">
                        MagyarÉkszer
                    </h1>
                    
                    <p className="text-xl md:text-3xl font-serif text-gold/80 uppercase tracking-[0.4em] mb-10">
                        {t('tradition')}
                    </p>
                    
                    <h2 className="text-3xl md:text-5xl font-script text-ivory/80 tracking-wide max-w-4xl mx-auto leading-relaxed pt-4">
                        {t('slogan')}
                    </h2>
                </div>

                <div className="absolute bottom-12 left-0 w-full z-10 px-8 flex flex-col gap-8 items-center text-center">
                    <div className="w-full">
                        <HomeCategoryRow />
                    </div>
                </div>
            </main>

            {/* Featured Section Removed per user request - products are only visible via categories */}

            {/* Artisan Workshop Section - Now showing the Credo Image */}
            <section className="py-32 bg-[#0d0902] px-4">
                <div className="max-w-[1200px] mx-auto">
                    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden premium-card shadow-2xl border border-gold/10">
                        <img 
                            src="/credo_fayaladar_v2.jpg" 
                            alt="Fáy Aladár Credo" 
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
