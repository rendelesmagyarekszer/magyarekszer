"use client";

import React, { useState } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { 
    Search, 
    Save, 
    Type, 
    Globe, 
    Check,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TextManager() {
    const { translations, updateTranslation } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');
    const [savedKey, setSavedKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    const categories = [
        { id: 'all', name: 'Összes' },
        { id: 'ui', name: 'Általános / UI' },
        { id: 'cats', name: 'Kategóriák' },
        { id: 'pages', name: 'Oldaltartalmak' },
        { id: 'order', name: 'Rendelési folyamat' },
        { id: 'options', name: 'Termék opciók' },
    ];

    const getCategoryForKey = (key: string) => {
        if (key.startsWith('cat_')) return 'cats';
        if (key.startsWith('page_') || ['about', 'gallery', 'contact', 'privacy', 'terms', 'mission', 'reference'].includes(key)) return 'pages';
        if (key.startsWith('cart_') || key.startsWith('shipping_') || key.startsWith('payment_') || key === 'checkout_title') return 'order';
        if (key.startsWith('stone_') || key.startsWith('accessory_') || key.startsWith('chain_') || key.toLowerCase().includes('leather')) return 'options';
        return 'ui';
    };

    // Get all unique keys from HU and EN (should be identical)
    const keys = Object.keys(translations.HU);
    
    const filteredKeys = keys.filter(key => {
        const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             translations.HU[key].toLowerCase().includes(searchQuery.toLowerCase()) ||
                             translations.EN[key].toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTab = activeTab === 'all' || getCategoryForKey(key) === activeTab;
        
        return matchesSearch && matchesTab;
    });

    const handleUpdate = (lang: 'HU' | 'EN', key: string, value: string) => {
        updateTranslation(lang, key, value);
        // Show a brief "saved" feedback for this specific key
        setSavedKey(`${lang}_${key}`);
        setTimeout(() => setSavedKey(null), 2000);
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-widest uppercase mb-2">Szövegek</h1>
                <p className="text-[#666666] text-sm uppercase tracking-[0.2em] font-bold italic">Weboldal tartalmának és fordításainak kezelése.</p>
            </div>

            {/* Warning / Info Box */}
            <div className="bg-[#c9a56a]/5 border border-[#c9a56a]/20 p-8 flex items-start gap-6">
                <AlertCircle className="h-6 w-6 text-[#c9a56a]" />
                <div className="space-y-2">
                    <p className="text-[#c9a56a] text-sm uppercase tracking-widest font-black">Információ</p>
                    <p className="text-[#999999] text-[13px] font-serif italic leading-relaxed">
                        A módosítások azonnal életbe lépnek az egész oldalon. A fordítási kulcsokat (pl. 'cart', 'checkout') ne módosítsa, csak a hozzájuk tartozó magyar és angol szövegeket.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                {/* Search Bar */}
                <div className="relative group w-full max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#c9a56a]/40 group-focus-within:text-[#c9a56a] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Szöveg vagy kulcs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#150e03] border border-[#c9a56a]/10 focus:border-[#c9a56a]/40 py-5 pl-16 pr-8 text-[12px] uppercase tracking-widest outline-none text-[#fdfdf3] placeholder-[#333333] transition-all font-bold"
                    />
                </div>

                {/* Info Text */}
                <div className="text-right">
                    <span className="text-xs text-gold/40 font-black uppercase tracking-widest">
                        {filteredKeys.length} találat ebben a nézetben
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gold/10 pb-6">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === cat.id 
                                ? 'bg-gold text-deep-brown rounded-md shadow-lg scale-105' 
                                : 'text-gold/40 hover:text-gold hover:bg-gold/5'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Translation List */}
            <div className="space-y-4 pb-20">
                {filteredKeys.map((key) => (
                    <div key={key} className="bg-[#150e03] border border-[#c9a56a]/10 group hover:border-[#c9a56a]/30 transition-all overflow-hidden flex flex-col md:flex-row">
                        {/* Key Info */}
                        <div className="md:w-64 p-8 border-b md:border-b-0 md:border-r border-[#c9a56a]/10 bg-[#0d0902]">
                            <span className="text-xs text-[#555555] uppercase tracking-widest font-black italic block mb-2 opacity-50">Kulcs</span>
                            <span className="text-sm uppercase tracking-widest font-black text-[#c9a56a] break-all">{key}</span>
                        </div>

                        {/* Translation Inputs */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                            {/* HU */}
                            <div className="p-8 space-y-4 border-b md:border-b-0 md:border-r border-[#c9a56a]/5 relative">
                                <label className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-black text-[#666666]">
                                    <Globe className="h-3 w-3 text-[#c9a56a]" /> Magyar (HU)
                                </label>
                                <textarea 
                                    value={translations.HU[key]}
                                    onChange={(e) => handleUpdate('HU', key, e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-[13px] font-serif italic text-[#fdfdf3] outline-none h-auto min-h-[40px] resize-none leading-relaxed"
                                    rows={1}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = (target.scrollHeight) + 'px';
                                    }}
                                ></textarea>
                                <AnimatePresence>
                                    {savedKey === `HU_${key}` && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-8 right-8"
                                        >
                                            <Check className="h-4 w-4 text-[#c9a56a]" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* EN */}
                            <div className="p-8 space-y-4 relative">
                                <label className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-black text-[#666666]">
                                    <Globe className="h-3 w-3 text-[#666666]" /> Angol (EN)
                                </label>
                                <textarea 
                                    value={translations.EN[key]}
                                    onChange={(e) => handleUpdate('EN', key, e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-[13px] font-serif italic text-[#999999] outline-none h-auto min-h-[40px] resize-none leading-relaxed"
                                    rows={1}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = (target.scrollHeight) + 'px';
                                    }}
                                ></textarea>
                                <AnimatePresence>
                                    {savedKey === `EN_${key}` && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-8 right-8"
                                        >
                                            <Check className="h-4 w-4 text-[#c9a56a]" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredKeys.length === 0 && (
                <div className="p-40 text-center">
                    <p className="text-[#333333] font-serif italic text-xl uppercase tracking-widest">Nem található ilyen szöveg vagy kulcs.</p>
                </div>
            )}
        </div>
    );
}
