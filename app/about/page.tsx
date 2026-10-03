"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Heart, Award } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function AboutPage() {
    const { t } = useConfig();

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] pt-32 pb-24">
            {/* Content Section */}
            {/* Content Section - Replaced with Credo Image */}
            <section className="max-w-5xl mx-auto px-4">
                <div className="premium-card p-12 md:p-20 text-center space-y-12">
                    <div className="space-y-8 text-ivory/90 leading-relaxed max-w-4xl mx-auto whitespace-pre-wrap" style={{ fontFamily: 'var(--font-bodoni), serif' }}>
                        <p className="text-lg md:text-xl text-justify">
                            Immáron 2002 óta készítjük saját tervezésű ékszereinket, a Magyar jelképhagyományból és a népművészet elemeiből merítve. A motívumok, melyekből építkezünk, a Magyar népi tradícióban szinte változatlan formában fennmaradó, átöröklődő ősi formakincs részei, melyek a Szkítáknál, a Hunoknál és a honfoglalás kori Magyarságnál egyaránt egységes rendszert alkotnak.
                        </p>

                        <p className="text-lg md:text-xl text-justify">
                            Mindez azért is fontos, mert az ékszer nem csak egy dísz, hanem az önkifejezés eszköze, szimbólumai által ráismerhetünk eredetünkre, megtalálhatjuk identitásunkat, megismerhetjük önmagunkat – vagyis útbaigazítást ad. Ráadásul, az ékszer mint tárgy természetéből fakadóun maradandó, így az is örökérvényű, amit jelképez.
                        </p>

                        <p className="text-lg md:text-xl text-justify">
                            Időtállóságát mutatják a Szkíta és Hun sírleletek és a honfoglalás kori emlékek is, melyeket a tervezésnél forrásként használunk. Emellett sokat merítünk az élő hagyományból és a népművészetből is, különösen fontosak a székely népi tradíció tulipános motívumai. A tárgyi és képi kútfőkön túl a szakirodalom is nagy segítségünkre volt és van, például Huszka József A magyar turáni ornamentika története c. munkája, Molnár V. József könyve, a Világ-virág és László Gyula írásai.
                        </p>

                        <p className="text-lg md:text-xl text-justify">
                            A forrásokból feltáruló Magyar jelképrendszer fő motívumai a sólyom, a szarvas, az isteni és istenanyai teremtő erő, az életfa, a különböző szem- és magdíszek, az indás és palmettás motívumok, az örök körforgás és a születés misztériumának szimbólumai, a virágmotívumok mint például a tulipán, ami az anyaméhet és a születő életet jelképezi. Ezek mind fellelhetőek ékszereinkben, melyek ezüstből, rézből és aranyból készülnek, továbbá az általunk használt anyagok közt szerepel még a tűzzománc, a csont és a szaru, illetve különböző nemes kövek és ásványok is.
                        </p>

                        <p className="text-lg md:text-xl text-justify">
                            A megszokottól eltérő módon eljegyzési és karikagyűrűinken is a fent említett motívumok szerepelnek, külön-külön gyűrűn, de a kettőt egymás mellé téve mégis egy egységben megjelenítve a női és a férfi minőséget.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-24">
                    <div className="text-center space-y-4">
                        <ShieldCheck className="h-8 w-8 text-gold mx-auto opacity-60" />
                        <h3 className="text-[12px] uppercase tracking-widest font-black text-gold/80">Hitelesség</h3>
                        <p className="text-[13px] text-ivory/40 leading-relaxed font-medium">Sírleletek és múzeumi tárgyak alapján készült pontos rekonstrukciók.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <Heart className="h-8 w-8 text-gold mx-auto opacity-60" />
                        <h3 className="text-[12px] uppercase tracking-widest font-black text-gold/80">Szenvedély</h3>
                        <p className="text-[13px] text-ivory/40 leading-relaxed font-medium">Kézzel készült, egyedi mestermunkák, melyek lelket visznek a nemesfémbe.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <Award className="h-8 w-8 text-gold mx-auto opacity-60" />
                        <h3 className="text-[12px] uppercase tracking-widest font-black text-gold/80">Minőség</h3>
                        <p className="text-[13px] text-ivory/40 leading-relaxed font-medium">Csak a legtisztább ezüst és arany alapanyagok felhasználásával.</p>
                    </div>
                </div>

                <div className="pt-20 text-center">
                    <Link href="/" className="inline-flex items-center gap-4 text-gold hover:text-[#fdfdf3] transition-all group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-[11px] uppercase tracking-[0.4em] font-black">{t('back_to_catalog')}</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-[#0d0902] border-t border-gold/5">
                <div className="max-w-[1400px] mx-auto px-4 text-center">
                    <p className="text-[9px] text-gold/20 tracking-[0.5em] font-black uppercase">MAGYAR ÉKSZER &copy; 2024 • TRADÍCIÓ</p>
                </div>
            </footer>
        </main>
    );
}
