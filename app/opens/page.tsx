"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function OpensPage() {
    const { t } = useConfig();

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-24 px-4 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

            <div className="max-w-3xl mx-auto relative z-10 text-center">
                <Link href="/" className="inline-flex items-center text-xs text-gold font-bold uppercase tracking-[0.3em] mb-12 hover:opacity-70 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back_to_home')}
                </Link>

                <div className="space-y-16">
                    <div className="space-y-4">
                        <Clock className="h-12 w-12 text-gold mx-auto opacity-40" />
                        <h1 className="text-4xl md:text-5xl font-serif text-ivory tracking-widest uppercase">{t('open_hours')}</h1>
                        <div className="h-px w-24 bg-gold/30 mx-auto"></div>
                    </div>

                    <div className="bg-ivory/5 border border-gold/10 p-12 rounded-2xl backdrop-blur-sm shadow-2xl">
                        <div className="text-ivory leading-relaxed space-y-8 text-xl md:text-2xl font-serif whitespace-pre-line">
                            {t('page_open_hours_content')}
                        </div>
                    </div>

                    <div className="pt-8 space-y-4">
                        <p className="text-[10px] text-gold/30 uppercase tracking-[0.3em] font-black italic">Műhelyünk címe</p>
                        <p className="text-ivory/60 uppercase tracking-widest font-black">{t('contact_address')}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
