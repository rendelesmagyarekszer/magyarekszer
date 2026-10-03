"use client";

import React, { useState } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { 
    Bell, 
    Mail, 
    Calendar, 
    Clock, 
    Trash2, 
    ChevronRight,
    Search,
    ShoppingBag,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function NotificationsPage() {
    const { notifications, formatPrice, t } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

    const filteredNotifications = notifications.filter(n => 
        n.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeNotif = notifications.find(n => n.id === selectedNotifId);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Értesítések</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">Simulated Email Notifications & Alerts</p>
                </div>
                <div className="relative w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Keresés az üzenetek között..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#150e03] border border-gold/10 p-4 pl-12 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* List of Notifications */}
                <div className="space-y-4">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-gold mb-8 flex items-center gap-4">
                        <Bell className="h-4 w-4" />
                        Üzenetek Előzményei
                    </h2>
                    
                    {filteredNotifications.length === 0 ? (
                        <div className="p-20 border border-dashed border-gold/10 text-center space-y-4 rounded-3xl">
                            <Mail className="h-12 w-12 text-gold/20 mx-auto" />
                            <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Nincsenek értesítések</p>
                        </div>
                    ) : (
                        filteredNotifications.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => setSelectedNotifId(n.id)}
                                className={`w-full text-left p-6 border transition-all flex items-start gap-6 group rounded-2xl ${
                                    selectedNotifId === n.id ? 'bg-gold/10 border-gold' : 'bg-[#150e03] border-gold/5 hover:border-gold/30'
                                }`}
                            >
                                <div className={`p-3 rounded-full shrink-0 ${selectedNotifId === n.id ? 'bg-gold text-deep-brown' : 'bg-gold/10 text-gold/60 group-hover:bg-gold/20'}`}>
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-base font-black text-ivory uppercase tracking-widest truncate">{n.subject}</h3>
                                        <span className="text-[10px] font-black text-ivory/20 whitespace-nowrap">{new Date(n.date).toLocaleDateString('hu-HU')}</span>
                                    </div>
                                    <p className="text-xs text-ivory/40 font-bold mb-2">{n.customerEmail}</p>
                                    <p className="text-xs text-gold/60 italic truncate">Összesen: {formatPrice(n.total)}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Notification Details (The "Email" view) */}
                <div className="bg-[#150e03] border border-gold/10 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] shadow-2xl">
                    <AnimatePresence mode="wait">
                        {activeNotif ? (
                            <motion.div 
                                key={activeNotif.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col h-full"
                            >
                                {/* Email Header */}
                                <div className="p-10 border-b border-gold/5 bg-gold/[0.02]">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-black italic">Tárgy:</p>
                                                <h3 className="text-xl font-serif text-ivory tracking-wide">{activeNotif.subject}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-black italic">Dátum:</p>
                                                <p className="text-sm font-serif text-ivory/80">{new Date(activeNotif.date).toLocaleString('hu-HU')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gold/5">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-black italic mb-1">Feladó:</p>
                                                <p className="text-[13px] font-black text-gold uppercase tracking-widest">MagyarÉkszer System</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-black italic mb-1">Címzett:</p>
                                                <p className="text-[13px] font-black text-ivory uppercase tracking-widest">magyarekszer@gmail.com</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="flex-1 p-10 space-y-10 overflow-y-auto">
                                    <div className="bg-white/[0.02] p-8 border border-white/5 space-y-8">
                                        <p className="text-base font-serif text-ivory/80 leading-relaxed italic">
                                            Tisztelt MagyarÉkszer!<br/><br/>
                                            Új megrendelés érkezett a webáruházból. Az alábbiakban találja a részleteket a számlázáshoz és a szállításhoz.
                                        </p>

                                        {/* Professional Data */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gold/10">
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-gold italic">Számlázási Adatok</h4>
                                                <div className="space-y-1">
                                                    <p className="text-base font-black text-ivory uppercase tracking-widest">{activeNotif.billing?.name}</p>
                                                    <p className="text-sm font-serif text-ivory/60">
                                                        {activeNotif.billing?.postcode} {activeNotif.billing?.city}<br/>
                                                        {activeNotif.billing?.address}
                                                    </p>
                                                    {activeNotif.billing?.taxNumber && (
                                                        <p className="text-xs font-bold text-gold mt-2">Adószám: {activeNotif.billing.taxNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-gold italic">Szállítási Adatok</h4>
                                                <div className="space-y-1">
                                                    <p className="text-base font-black text-ivory uppercase tracking-widest">{activeNotif.customerName}</p>
                                                    <p className="text-sm font-serif text-ivory/60">
                                                        {activeNotif.shipping?.postcode} {activeNotif.shipping?.city}<br/>
                                                        {activeNotif.shipping?.address}
                                                    </p>
                                                    <p className="text-xs font-bold text-ivory/40 mt-2 italic">Mód: {activeNotif.shipping?.method}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-gold italic">Rendelt Termékek</h4>
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gold/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#666]">
                                                        <th className="py-2 pb-4">Termék</th>
                                                        <th className="py-2 pb-4 text-center">Menny.</th>
                                                        <th className="py-2 pb-4 text-right">Ár</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm font-serif text-ivory/80">
                                                    {activeNotif.items?.map((item: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-white/[0.02]">
                                                            <td className="py-4 pr-4">
                                                                <p className="font-bold">{item.name}</p>
                                                                <p className="text-[11px] text-gold/40 mt-1">{item.customization}</p>
                                                            </td>
                                                            <td className="py-4 text-center">{item.quantity}</td>
                                                            <td className="py-4 text-right">{formatPrice(item.price)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-between items-end pt-6">
                                            <p className="text-xs font-black uppercase tracking-widest text-[#666]">Végösszeg:</p>
                                            <p className="text-2xl font-black text-gold tracking-tight">{formatPrice(activeNotif.total)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 border-t border-gold/5 flex justify-end gap-6">
                                    <Link 
                                        href="/admin/orders"
                                        className="bg-gold text-deep-brown px-8 py-3 rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Rendelés Kezelése
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-20">
                                <Mail className="h-16 w-16 text-gold" />
                                <p className="text-xs uppercase tracking-[0.3em] font-black text-ivory">Válassz ki egy értesítést a megtekintéshez</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
