"use client";

import React from 'react';

import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';

export default function ContactPage() {
    const { t } = useConfig();

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3]">
            {/* Grid Section - Instantly Visible */}
            <section className="max-w-[1400px] mx-auto px-4 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: Contact Info */}
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-serif text-ivory tracking-widest uppercase">Keressen Minket Bizalommal</h2>
                            <p className="text-ivory/50 text-lg font-serif italic leading-relaxed whitespace-pre-line">
                                {t('page_contact_content')}
                            </p>
                        </div>

                        <div className="space-y-12 pb-12 border-b border-gold/10">
                            <div className="flex items-start gap-8 group">
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-full text-gold group-hover:bg-gold group-hover:text-deep-brown transition-all overflow-hidden relative">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gold/60">E-mail Elérhetőség</h3>
                                    <p className="text-lg font-serif text-ivory hover:text-gold transition-colors">{t('contact_email_1')}</p>
                                    {t('contact_email_2') && <p className="text-lg font-serif text-ivory hover:text-gold transition-colors">{t('contact_email_2')}</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-8 group">
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-full text-gold group-hover:bg-gold group-hover:text-deep-brown transition-all">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gold/60">Telefonos Elérhetőség</h3>
                                    <p className="text-lg font-serif text-ivory">{t('contact_phone_1')}</p>
                                    {t('contact_phone_2') && <p className="text-lg font-serif text-ivory">{t('contact_phone_2')}</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-8 group">
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-full text-gold group-hover:bg-gold group-hover:text-deep-brown transition-all">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gold/60">Helyszín</h3>
                                    <p className="text-lg font-serif text-ivory">{t('contact_address')}</p>
                                    <p className="text-[11px] text-ivory/40 uppercase tracking-widest font-black">{t('contact_location_hint')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-8 group">
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-full text-gold group-hover:bg-gold group-hover:text-deep-brown transition-all">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gold/60">Műhely Nyitvatartás</h3>
                                    <div className="text-lg font-serif text-ivory space-y-1 whitespace-pre-line">
                                        {t('page_open_hours_content')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="p-10 bg-white/[0.03] border border-gold/10 rounded-xl space-y-8 shadow-2xl">
                            <h3 className="text-[14px] uppercase tracking-[0.4em] font-black text-gold border-b border-gold/10 pb-4 italic">Banki Adatok</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[15px] font-serif text-ivory/90">
                                <div>
                                    <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-2 font-black">Bank</p>
                                    <p className="tracking-wide">{t('bank_name')}</p>
                                </div>
                                <div>
                                    <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-2 font-black">Számlaszám</p>
                                    <p className="tracking-widest font-mono text-gold selection:bg-gold selection:text-deep-brown">{t('bank_account')}</p>
                                </div>
                                <div className="md:col-span-2 py-4 border-t border-white/5">
                                    <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-2 font-black">IBAN</p>
                                    <p className="tracking-widest font-mono text-gold selection:bg-gold selection:text-deep-brown">{t('bank_iban')}</p>
                                </div>
                                <div>
                                    <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-2 font-black">SWIFT / BIC</p>
                                    <p className="tracking-widest font-mono text-gold">{t('bank_swift')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <a href="https://facebook.com/magyarekszer" target="_blank" className="text-ivory/40 hover:text-gold transition-colors flex items-center gap-3 group">
                                <FacebookIcon className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Facebook</span>
                            </a>
                        </div>
                    </div>

                    {/* Right: Google Map */}
                    <div className="bg-ivory/5 border border-gold/10 p-2 lg:p-4 rounded-xl backdrop-blur-sm shadow-3xl h-[600px] sticky top-32">
                        <iframe 
                            src="https://www.google.com/maps?q=1056+Budapest,+Moln%C3%A1r+u.+23.&output=embed" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, borderRadius: '8px', filter: 'invert(90%) hue-rotate(180deg) sepia(20%)' }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="mt-24 pt-16 border-t border-gold/10 max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-serif text-ivory tracking-widest uppercase mb-4">Írjon Nekünk</h2>
                        <p className="text-sm text-gold/60 uppercase tracking-[0.2em] font-black">Kérdése van? Segítünk!</p>
                    </div>
                    <div className="bg-ivory/5 border border-gold/10 p-12 rounded-xl backdrop-blur-sm shadow-3xl">
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gold/60">Név</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-deep-brown border border-gold/10 p-4 text-[13px] text-ivory outline-none focus:border-gold/40 transition-all rounded"
                                        placeholder="Az Ön neve"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gold/60">E-mail</label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-deep-brown border border-gold/10 p-4 text-[13px] text-ivory outline-none focus:border-gold/40 transition-all rounded"
                                        placeholder="example@email.hu"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gold/60">Üzenet</label>
                                <textarea 
                                    rows={5}
                                    className="w-full bg-deep-brown border border-gold/10 p-4 text-[13px] text-ivory outline-none focus:border-gold/40 transition-all rounded resize-none"
                                    placeholder="Miben segíthetünk?"
                                ></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button className="gold-button w-full md:w-auto px-16 py-5 text-[11px] font-black tracking-[0.5em] shadow-xl">
                                    Üzenet Küldése
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-24 pt-20 border-t border-gold/5 flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-4 text-gold hover:text-[#fdfdf3] transition-all group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-[11px] uppercase tracking-[0.4em] font-black">{t('back_to_home')}</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
