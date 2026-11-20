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
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday"
                ],
                "opens": "10:00",
                "closes": "17:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Friday",
                "opens": "10:00",
                "closes": "16:00"
            }
        ]
    };

    return (
        <div className="flex flex-col w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="relative min-h-[calc(100vh-7rem)] flex flex-col items-center justify-between py-6 sm:py-10 md:py-0 md:justify-center overflow-hidden">
                {/* Background with parallax-like effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-deep-brown via-transparent to-deep-brown"></div>
                </div>

                {/* Central Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-up my-auto md:my-0 pb-6 md:pb-32">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4 drop-shadow-2xl gold-text">
                        MagyarÉkszer
                    </h1>
                    
                    <p className="text-base sm:text-xl md:text-3xl font-serif text-gold/80 uppercase tracking-[0.25em] sm:tracking-[0.4em] mb-4 sm:mb-10">
                        {t('tradition')}
                    </p>
                    
                    <h2 className="text-xl sm:text-3xl md:text-5xl font-script text-ivory/80 tracking-wide max-w-4xl mx-auto leading-relaxed pt-2 sm:pt-4">
                        {t('slogan')}
                    </h2>
                </div>

                <div className="relative mt-4 md:absolute md:bottom-12 left-0 w-full z-10 px-2 sm:px-8 flex flex-col gap-4 sm:gap-8 items-center text-center">
                    <div className="w-full">
                        <HomeCategoryRow />
                    </div>
                </div>
            </main>

            {/* Featured Section Removed per user request - products are only visible via categories */}

            {/* Artisan Workshop Section - Now showing the Credo Image */}
            <section className="py-12 sm:py-24 md:py-32 bg-[#0d0902] px-4">
                <div className="max-w-[1200px] mx-auto">
                    <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden premium-card shadow-2xl border border-gold/10">
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
