"use client";

import React, { useState } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { Coupon } from '@/lib/data';
import { 
    Ticket, 
    Plus, 
    Trash2, 
    Calendar, 
    Percent, 
    Banknote, 
    AlertCircle,
    CheckCircle2,
    X,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCouponsPage() {
    const { coupons, saveCoupon, deleteCoupon, formatPrice } = useConfig();
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State
    const [newCoupon, setNewCoupon] = useState<Coupon>({
        code: '',
        discountType: 'percentage',
        value: 10,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true
    });

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveCoupon({
            ...newCoupon,
            code: newCoupon.code.toUpperCase().trim()
        });
        setIsAdding(false);
        setNewCoupon({
            code: '',
            discountType: 'percentage',
            value: 10,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        });
    };

    const isExpired = (date: string) => {
        return new Date(date) < new Date();
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Kuponok</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">Discount & Promotion Management</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-gold text-deep-brown px-8 py-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                >
                    <Plus className="h-4 w-4" />
                    Új Kupon
                </button>
            </div>

            {/* List & Search */}
            <div className="space-y-8">
                <div className="relative w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Keresés kód szerint..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#150e03] border border-gold/10 p-4 pl-12 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold transition-all shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCoupons.length === 0 ? (
                        <div className="col-span-full p-20 border border-dashed border-gold/10 text-center space-y-4 rounded-3xl">
                            <Ticket className="h-12 w-12 text-gold/20 mx-auto" />
                            <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Nincsenek aktív kuponok</p>
                        </div>
                    ) : (
                        filteredCoupons.map((coupon) => (
                            <div 
                                key={coupon.code}
                                className={`bg-[#150e03] border p-8 space-y-6 relative overflow-hidden group transition-all rounded-2xl ${
                                    isExpired(coupon.expiryDate) ? 'border-red-500/20 opacity-60' : 'border-gold/10 hover:border-gold/30 shadow-2xl hover:shadow-gold/5'
                                }`}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Ticket className="h-24 w-24 -mr-8 -mt-8" />
                                </div>

                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gold tracking-widest uppercase">{coupon.code}</h3>
                                        <p className="text-[11px] font-black text-ivory/40 uppercase tracking-[0.2em] italic">
                                            {coupon.discountType === 'percentage' ? 'Százalékos' : 'Fix összegű'} kedvezmény
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => deleteCoupon(coupon.code)}
                                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 py-6 border-y border-gold/5">
                                    <div className="bg-gold/5 p-4 rounded-xl border border-gold/10">
                                        {coupon.discountType === 'percentage' ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-ivory">{coupon.value}</span>
                                                <span className="text-gold text-lg">%</span>
                                            </div>
                                        ) : (
                                            <span className="text-2xl font-black text-ivory">{formatPrice(coupon.value)}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-gold/40" />
                                            <span className={`text-xs font-bold ${isExpired(coupon.expiryDate) ? 'text-red-400' : 'text-ivory/60'}`}>
                                                Lejárat: {coupon.expiryDate}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className={`h-3 w-3 ${coupon.isActive ? 'text-green-500' : 'text-red-500'}`} />
                                            <span className="text-xs font-bold text-ivory/60 uppercase tracking-widest">
                                                {coupon.isActive ? 'Aktív' : 'Inaktív'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isExpired(coupon.expiryDate) && (
                                    <div className="flex items-center gap-2 text-red-500/60 font-black text-[10px] uppercase tracking-widest italic animate-pulse">
                                        <AlertCircle className="h-3 w-3" />
                                        Ez a kupon lejárt!
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000]/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#150e03] border border-gold/20 w-full max-w-lg p-12 shadow-[0_0_100px_rgba(201,165,106,0.1)] rounded-[2rem]"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-2xl font-serif text-ivory uppercase tracking-[0.2em] italic">Új Kupon Létrehozása</h2>
                                <button onClick={() => setIsAdding(false)} className="text-gold/40 hover:text-gold transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-[0.3em] font-black text-gold italic">Kuponkód</label>
                                    <input 
                                        type="text" 
                                        placeholder="pl: NYAR2024"
                                        required 
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base font-black text-ivory outline-none focus:border-gold transition-all uppercase tracking-widest"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] uppercase tracking-[0.3em] font-black text-gold italic">Típus</label>
                                        <div className="flex bg-[#0d0902] border border-gold/10 p-1">
                                            <button 
                                                type="button"
                                                onClick={() => setNewCoupon({...newCoupon, discountType: 'percentage'})}
                                                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${newCoupon.discountType === 'percentage' ? 'bg-gold text-deep-brown' : 'text-ivory/40'}`}
                                            >
                                                Százalék
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setNewCoupon({...newCoupon, discountType: 'fixed'})}
                                                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${newCoupon.discountType === 'fixed' ? 'bg-gold text-deep-brown' : 'text-ivory/40'}`}
                                            >
                                                Fix összeg
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] uppercase tracking-[0.3em] font-black text-gold italic">Érték ({newCoupon.discountType === 'percentage' ? '%' : 'Ft'})</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={newCoupon.value}
                                            onChange={(e) => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})}
                                            className="w-full bg-[#0d0902] border border-gold/10 p-4 text-base font-black text-ivory outline-none focus:border-gold transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-[0.3em] font-black text-gold italic">Lejárati Dátum</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={newCoupon.expiryDate}
                                        onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base font-black text-ivory outline-none focus:border-gold transition-all [color-scheme:dark]"
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <input 
                                        type="checkbox" 
                                        id="isActive"
                                        checked={newCoupon.isActive}
                                        onChange={(e) => setNewCoupon({...newCoupon, isActive: e.target.checked})}
                                        className="w-6 h-6 border-gold/20 bg-black accent-gold"
                                    />
                                    <label htmlFor="isActive" className="text-xs uppercase tracking-[0.2em] font-black text-ivory/60 italic cursor-pointer">A kupon azonnal aktív legyen</label>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-gold text-deep-brown py-6 font-black tracking-[0.5em] uppercase text-[13px] hover:scale-[1.02] transition-all shadow-2xl mt-8"
                                >
                                    Kupon Mentése
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
