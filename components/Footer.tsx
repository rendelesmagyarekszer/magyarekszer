"use client";

import React from 'react';
import Link from 'next/link';
import { useConfig } from './ConfigProvider';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t } = useConfig();

    return (
        <footer className="bg-[#0d0902] border-t border-gold/10 pt-24 pb-12 px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-block group">
                            <h2 className="text-2xl font-serif tracking-[0.4em] uppercase gold-text group-hover:scale-105 transition-transform duration-500">
                                MAGYARÉKSZER
                            </h2>
                            <div className="w-12 h-[1px] bg-gold/30 mt-1"></div>
                        </Link>
                        <p className="text-ivory/60 text-xs font-serif leading-loose max-w-xs">
                            {t('tradition_footer')}
                        </p>
                        <div className="flex items-center gap-6 pt-4">
                            <a href="https://facebook.com/magyarekszer" target="_blank" className="text-gold/40 hover:text-gold transition-colors">
                                <FacebookIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gold/40 hover:text-gold transition-colors">
                                <InstagramIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-gold/80">{t('about')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('about')}</Link></li>
                            <li><Link href="/mission" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('mission')}</Link></li>
                            <li><Link href="/contact" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('contact')}</Link></li>
                            <li><Link href="/gallery" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('gallery')}</Link></li>
                            <li><Link href="/reference" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('reference')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Terms */}
                    <div className="space-y-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-gold/80">{t('terms')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/privacy" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('privacy')}</Link></li>
                            <li><Link href="/shipping" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('shipping')}</Link></li>
                            <li><Link href="/terms" className="text-sm uppercase tracking-[0.1em] text-ivory/40 hover:text-gold transition-colors font-bold">{t('terms')}</Link></li>
                        </ul>
                    </div>

                    {/* Workshop Info */}
                    <div className="space-y-8 p-8 bg-ivory/5 border border-gold/5 rounded-xl shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gold/20"></div>
                        <Link href="/contact" className="group/link block">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-gold group-hover/link:translate-x-1 transition-transform">{t('contact')}</h3>
                        </Link>
                        <div className="flex items-start gap-4 pt-4">
                            <MapPin className="h-4 w-4 text-gold/40 flex-shrink-0" />
                            <p>1056 Budapest,<br/><span className="text-ivory mt-1 block">Molnár utca 23.</span></p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-gold/5 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-ivory/30 uppercase tracking-widest font-serif leading-relaxed">
                        <div className="space-y-2">
                            <p className="text-gold/60 font-black">Impresszum</p>
                            <p>Üzemeltető: MARTIN'S BT.</p>
                            <p>Székhely: 1056 Budapest, Molnár utca 23.</p>
                            <p>Adószám: 28110143-2-41</p>
                            <p>EU Adószám: HU28110143</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gold/60 font-black">Banki Adatok</p>
                            <p>Bank: K&H Bank Zrt.</p>
                            <p>Számlaszám: 10404089-50526774-52721009</p>
                            <p>IBAN: HU62 1040 4089 5052 6774 5272 1009</p>
                            <p>SWIFT: OKHBHUHB</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gold/60 font-black">Tárhelyszolgáltató</p>
                            <p>Név: Google Cloud Platform</p>
                            <p>Cím: 1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA</p>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-gold/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <p className="text-xs text-[#555555] tracking-[0.2em] font-black uppercase">
                            MAGYAR ÉKSZER &copy; 2024 • TRADÍCIONÁLIS ÖTVÖSMŰVÉSZET
                        </p>
                        <div className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer">
                            <ShieldCheck className="h-4 w-4 text-gold" />
                            <span className="text-xs font-black uppercase tracking-widest">{t('workshop_security')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const Clock = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

export default Footer;
