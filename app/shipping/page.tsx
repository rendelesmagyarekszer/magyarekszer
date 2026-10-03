"use client";

import React from 'react';
import Link from 'next/link';
import { Truck, Package, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function ShippingPage() {
    const { t } = useConfig();

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3]">
            {/* Shipping Hero */}
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#150e03]/80 via-transparent to-[#150e03]"></div>
                
                <div className="relative z-10 text-center px-4 pt-20">
                    <Truck className="h-12 w-12 text-gold mx-auto mb-6 opacity-60" />
                    <h1 className="text-4xl md:text-6xl font-serif tracking-[0.4em] uppercase mb-8 gold-text animate-fade-up">
                        {t('shipping')}
                    </h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 py-24">
                <div className="bg-ivory/5 border border-gold/10 p-12 md:p-20 rounded-3xl space-y-20 backdrop-blur-sm shadow-2xl">
                    
                    {/* Shipping Intro */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-gold/60">
                            <Package className="h-5 w-5" />
                            <h2 className="text-[12px] uppercase tracking-[0.3em] font-black italic">Szállítási Tájékoztató</h2>
                        </div>
                        <div className="space-y-6 text-ivory/70 leading-loose font-serif text-lg whitespace-pre-line">
                            {t('page_shipping_content')}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Delivery Methods */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-serif text-ivory tracking-widest uppercase border-b border-gold/10 pb-4">Szállítási Módok</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-gold/5 rounded-xl border border-gold/5 space-y-2">
                                    <h4 className="text-gold text-[10px] uppercase tracking-widest">Házhozszállítás (MPL)</h4>
                                    <p className="text-[13px] text-ivory/40">Gyors és biztonságos belföldi szállítás, akár a következő munkanapra.</p>
                                </div>
                                <div className="p-6 bg-gold/5 rounded-xl border border-gold/5 space-y-2">
                                    <h4 className="text-gold text-[10px] uppercase tracking-widest">Csomagautomata</h4>
                                    <p className="text-[13px] text-ivory/40">Várja meg a csomagot az Önhöz legközelebbi automatánál.</p>
                                </div>
                                <div className="p-6 bg-gold/5 rounded-xl border border-gold/5 space-y-2">
                                    <h4 className="text-gold text-[10px] uppercase tracking-widest">Személyes Átvétel</h4>
                                    <p className="text-[13px] text-ivory/40">Műhelyünkben ingyenesen átvehető: 1056 Budapest, Molnár u. 23.</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Times */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 text-gold/60">
                                <Clock className="h-5 w-5" />
                                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black">Szállítási Idők</h3>
                            </div>
                            <div className="space-y-6 text-ivory/50 leading-relaxed text-[14px]">
                                <p><strong>Készleten lévő termékek:</strong> 2-4 munkanap.</p>
                                <p><strong>Egyedi rendelések / Arany ékszerek:</strong> 10-15 munkanap a készítési idő függvényében.</p>
                                <p className="p-6 bg-ivory/5 rounded-xl border border-ivory/5 italic">
                                    "Munkáink nagy része kézzel készül, így a megrendelés leadása után pontosabb tájékoztatást küldünk e-mailben."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-gold/5"></div>

                    {/* Security */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-4 text-gold/60">
                            <ShieldCheck className="h-5 w-5" />
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black">Biztonság és Garancia</h3>
                        </div>
                        <div className="space-y-6 text-ivory/60 leading-relaxed text-[14px]">
                            <p>A csomagok tartalmára teljes körű értékbiztosítást kötünk. Minden ékszer díszdobozban és biztonságos külső csomagolásban kerül feladásra.</p>
                        </div>
                    </div>

                </div>

                <div className="mt-20 pt-20 border-t border-gold/5 flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-4 text-gold hover:text-[#fdfdf3] transition-all group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-[11px] uppercase tracking-[0.4em] font-black">{t('back_to_home')}</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
