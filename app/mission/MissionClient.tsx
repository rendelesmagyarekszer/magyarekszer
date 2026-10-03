"use client";

import React from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Gem, Activity, Cpu, Layers, Cog, 
    Shield, Workflow, Sparkles, Hammer, Database, 
    Cross, Zap, Wrench, Star, Phone 
} from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';
import { motion } from 'framer-motion';

export default function MissionClient() {
    const { t, extraServices } = useConfig();

    const castingMaterials = extraServices.filter(s => s.category === 'casting');
    const digitalServices = extraServices.filter(s => s.category === 'digital');
    const workshopServices = extraServices.filter(s => s.category === 'workshop');
    const specialtyServices = extraServices.filter(s => s.category === 'specialty');

    const getIcon = (iconName?: string, className: string = "h-6 w-6") => {
        if (!iconName) return <Gem className={className} />;
        
        switch(iconName) {
            case 'Gem': return <Gem className={className} />;
            case 'Activity': return <Activity className={className} />;
            case 'Cpu': return <Cpu className={className} />;
            case 'Layers': return <Layers className={className} />;
            case 'Cog': return <Cog className={className} />;
            case 'Shield': return <Shield className={className} />;
            case 'Workflow': return <Workflow className={className} />;
            case 'Sparkles': return <Sparkles className={className} />;
            case 'Hammer': return <Hammer className={className} />;
            case 'Database': return <Database className={className} />;
            case 'Cross': return <Cross className={className} />;
            case 'Zap': return <Zap className={className} />;
            case 'Wrench': return <Wrench className={className} />;
            case 'Star': return <Star className={className} />;
            case 'Phone': return <Phone className={className} />;
            default: return <Gem className={className} />;
        }
    };

    const SectionHeader = ({ title, icon: Icon, subtitle }: { title: string, icon: any, subtitle?: string }) => (
        <div className="space-y-2 md:space-y-4 mb-8 md:mb-12">
            <div className="flex items-center gap-4 md:gap-6">
                <div className="p-3 md:p-4 bg-gold/5 border border-gold/10 rounded-xl text-gold shrink-0">
                    <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h2 className="text-xl md:text-3xl font-serif text-ivory tracking-widest uppercase">{title}</h2>
            </div>
            {subtitle && <p className="text-ivory/40 text-xs md:text-sm uppercase tracking-[0.3em] font-medium ml-0 md:ml-20 mt-2 md:mt-0">{subtitle}</p>}
        </div>
    );

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] pb-24 pt-10">
            <div className="max-w-6xl mx-auto px-6 space-y-32">
                
                {/* 1. Precision Casting */}
                <section id="ontes">
                    <SectionHeader title={t('casting_title') || "Precíziós Öntés"} icon={Zap} subtitle="Öntési technológia" />
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="ml-0 md:ml-20 mb-8 md:mb-12 p-5 md:p-6 bg-gold/5 border border-gold/20 rounded-2xl flex items-start gap-4 md:gap-6 max-w-2xl"
                    >
                        <div className="p-3 bg-gold/20 rounded-xl text-gold shrink-0">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-[#fdfdf3] mb-1">Időpont Érdeklődés</h4>
                            <p className="text-[14px] text-gold/80 leading-relaxed font-bold">
                                Az eheti öntés pontos napjáról kérjük, érdeklődjön telefonon!
                            </p>
                        </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 ml-0 md:ml-20">
                        {castingMaterials.map((item, idx) => (
                            <motion.div 
                                key={item.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-ivory/5 border border-gold/10 rounded-xl hover:bg-gold/5 transition-all group"
                            >
                                <div className="mb-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-gold/10 rounded-lg text-gold group-hover:scale-110 transition-transform">
                                            {getIcon(item.icon, "h-6 w-6")}
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[9px] uppercase tracking-tighter text-gold/60 font-black">Öntési díj</span>
                                                <span className="text-[10px] uppercase tracking-widest text-gold font-bold px-3 py-1 bg-gold/10 rounded-full">{item.price}</span>
                                            </div>
                                            {item.price2 && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] uppercase tracking-tighter text-gold/60 font-black">Anyag ár</span>
                                                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold px-3 py-1 bg-gold/10 rounded-full">{item.price2}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-serif text-ivory mb-3">{item.name}</h3>
                                <p className="text-sm text-ivory/40 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. Digital Services */}
                <section id="3d-tervezes">
                    <SectionHeader title="Digitális Ékszertervezés" icon={Cpu} subtitle="CAD / CAM Megoldások" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ml-0 md:ml-20">
                        {digitalServices.map((item, idx) => (
                            <motion.div 
                                key={item.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="p-6 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-4 hover:border-gold/20 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="text-gold opacity-60 group-hover:opacity-100 transition-opacity">
                                        {getIcon(item.icon, "h-5 w-5")}
                                    </div>
                                    <div className="text-right space-y-1">
                                        <span className="text-[10px] text-gold/80 font-black uppercase tracking-widest block">{item.price}</span>
                                        {item.price2 && <span className="text-[9px] text-gold/40 font-bold uppercase tracking-widest block">{item.price2}</span>}
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-ivory/80">{item.name}</h4>
                                <p className="text-[13px] text-ivory/40 leading-relaxed flex-grow">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. Workshop & Repairs */}
                <section className="relative">
                    <div className="absolute -left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent"></div>
                    <SectionHeader title="Műhely Szolgáltatások" icon={Wrench} subtitle="Hagyományos és Modern Ötvösmunkák" />
                    <div className="space-y-4 ml-0 md:ml-20">
                        {workshopServices.map((item, idx) => (
                            <motion.div 
                                key={item.id || idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-6 bg-ivory/5 border border-gold/5 rounded-xl hover:border-gold/20 transition-all group"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="text-gold opacity-40 group-hover:scale-125 transition-transform group-hover:opacity-100">
                                        {getIcon(item.icon, "h-5 w-5")}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-serif text-ivory">{item.name}</h4>
                                        <p className="text-xs text-ivory/30 uppercase tracking-widest">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-[11px] font-black text-gold uppercase tracking-[0.2em]">{item.price}</span>
                                    {item.price2 && <span className="text-[9px] font-bold text-gold/40 uppercase tracking-widest">{item.price2}</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. Specialty Services */}
                <section id="egyedi-ekszer">
                    <SectionHeader title="Különleges Megbízások" icon={Star} subtitle="Egyedi Igények Megvalósítása" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ml-0 md:ml-20">
                        {specialtyServices.map((item, idx) => (
                            <div key={item.id || idx} className="group relative">
                                <div className="absolute inset-0 bg-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-10 bg-black/40 border border-gold/10 rounded-2xl flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="p-4 bg-gold/10 rounded-full text-gold">
                                            {getIcon(item.icon, "h-6 w-6")}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gold/60 uppercase tracking-widest mb-1 italic">Árazás</p>
                                            <p className="text-sm font-bold text-gold uppercase tracking-widest">{item.price}</p>
                                            {item.price2 && <p className="text-xs font-bold text-gold/60 uppercase tracking-widest mt-1">{item.price2}</p>}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-serif text-ivory">{item.name}</h3>
                                    <p className="text-ivory/40 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-20 text-center border-t border-gold/5">
                    <Link href="/" className="inline-flex items-center gap-4 text-gold hover:text-[#fdfdf3] transition-all group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-[11px] uppercase tracking-[0.4em] font-black">{t('back_to_home')}</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
