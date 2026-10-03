"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gavel } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function TermsPage() {
    const { t } = useConfig();

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-24 px-4 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center text-xs text-gold font-bold uppercase tracking-[0.3em] mb-12 hover:opacity-70 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back_to_home')}
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <Gavel className="h-10 w-10 text-gold opacity-40" />
                        <h1 className="text-2xl md:text-3xl font-serif text-ivory tracking-widest uppercase">{t('terms')}</h1>
                        <div className="h-px w-24 bg-gold/30"></div>
                    </div>

                    <div className="prose prose-invert prose-gold max-w-none">
                        <div className="text-ivory/90 leading-relaxed space-y-8 text-[17px] whitespace-pre-line font-medium">
                            {t('page_terms_content')}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
