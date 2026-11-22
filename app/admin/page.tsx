"use client";

import React, { useState, useEffect } from 'react';
import { getTrafficData, TrafficData } from '@/components/VisitorTracker';
import { useConfig } from '@/components/ConfigProvider';
import { 
    Package, 
    Type, 
    TrendingUp, 
    Clock, 
    Plus, 
    Info,
    X,
    Layers,
    BarChart3,
    Globe,
    Users,
    ExternalLink,
    Trash2,
    Edit2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_STONES } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';
import { ShoppingBag, Star, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
    const { 
        products, 
        translations, 
        formatPrice, 
        t, 
        vacationMode, 
        setVacationMode, 
        availableStones, 
        setAvailableStones, 
        allStonesMaster, 
        addStone, 
        deleteStone,
        updateStonePrice,
        updateTranslation,
        stonePrices,
        collections,
        shippingSettings,
        updateShippingSettings
    } = useConfig();
    
    const { allOrders: localOrders } = useAuth();
    const [serverOrders, setServerOrders] = useState<any[]>([]);
    const [salesSearch, setSalesSearch] = useState('');
    
    const [newStoneHu, setNewStoneHu] = useState('');
    const [newStoneEn, setNewStoneEn] = useState('');
    const [newStonePrice, setNewStonePrice] = useState('3000');
    const [isAddingStone, setIsAddingStone] = useState(false);
    const [editingStoneKey, setEditingStoneKey] = useState<string | null>(null);
    const [editingNameKey, setEditingNameKey] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');
    const [tempName, setTempName] = useState<string>('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsTab, setAnalyticsTab] = useState<'traffic' | 'sales'>('sales');
    const [bestSellersTab, setBestSellersTab] = useState<'all' | 'month'>('all');
    const [trafficStats, setTrafficStats] = useState<TrafficData>({
        totalViews: 0,
        uniqueVisits: 0,
        daily: {},
        hourly: {},
        pages: {},
        devices: { mobile: 0, desktop: 0 },
        lastUpdated: ''
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTrafficStats(getTrafficData());
            fetch(`/api/orders.php?t=${Date.now()}`, { cache: 'no-store' })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.success && Array.isArray(data.orders)) {
                        setServerOrders(data.orders);
                    }
                })
                .catch(() => {});
        }
    }, [showAnalytics]);

    // Merge server orders + local orders (deduplicated by id, newest first)
    const orders = React.useMemo(() => {
        const map = new Map<string, any>();
        [...serverOrders, ...localOrders].forEach((o: any) => {
            if (!o) return;
            const key = o.id || `${o.date}_${o.total}_${o.customerInfo?.email || ''}`;
            if (!map.has(key)) {
                map.set(key, o);
            }
        });
        return Array.from(map.values()).sort((a, b) => {
            const ta = new Date(a.date || 0).getTime();
            const tb = new Date(b.date || 0).getTime();
            return tb - ta;
        });
    }, [serverOrders, localOrders]);

    // Sales Statistics Calculation
    const productSales: Record<string, { quantity: number, revenue: number, image?: string }> = {};
    const monthlyProductSales: Record<string, { quantity: number, revenue: number, image?: string }> = {};
    const monthlySales: Record<string, { revenue: number, orders: number }> = {};
    const yearlySales: Record<string, { revenue: number, orders: number }> = {};
    let totalRevenue = 0;

    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    orders.forEach(order => {
        const date = new Date(order.date || Date.now());
        const monthKey = isNaN(date.getTime()) ? currentMonthKey : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const yearKey = isNaN(date.getTime()) ? `${new Date().getFullYear()}` : `${date.getFullYear()}`;
        const orderTotal = Number(order.total) || 0;
        
        totalRevenue += orderTotal;

        // Monthly
        if (!monthlySales[monthKey]) monthlySales[monthKey] = { revenue: 0, orders: 0 };
        monthlySales[monthKey].revenue += orderTotal;
        monthlySales[monthKey].orders += 1;

        // Yearly
        if (!yearlySales[yearKey]) yearlySales[yearKey] = { revenue: 0, orders: 0 };
        yearlySales[yearKey].revenue += orderTotal;
        yearlySales[yearKey].orders += 1;

        // Products
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
                const name = item.name || 'Ismeretlen termék';
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                if (!productSales[name]) productSales[name] = { quantity: 0, revenue: 0, image: item.image };
                productSales[name].quantity += qty;
                productSales[name].revenue += (price * qty);

                if (monthKey === currentMonthKey) {
                    if (!monthlyProductSales[name]) monthlyProductSales[name] = { quantity: 0, revenue: 0, image: item.image };
                    monthlyProductSales[name].quantity += qty;
                    monthlyProductSales[name].revenue += (price * qty);
                }
            });
        }
    });

    const bestSellers = Object.entries(productSales)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10);

    const monthlyBestSellers = Object.entries(monthlyProductSales)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10);

    const sortedMonths = Object.entries(monthlySales)
        .sort((a, b) => b[0].localeCompare(a[0]));

    const currentMonthRevenue = monthlySales[currentMonthKey]?.revenue || 0;
    
    // Quick statistics
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
    
    const stats = [
        { label: 'Havi Top Termék', value: monthlyBestSellers[0]?.[0] || '-', icon: Star, color: 'text-gold' },
        { label: 'Összesített Top Termék', value: bestSellers[0]?.[0] || '-', icon: Package, color: 'text-[#c9a56a]' },
        { label: 'Összes Bevétel', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-400' },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-5xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Vezérlőpult</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">MagyarÉkszer Artisan Management</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-[#666666] font-bold mb-1">Utolsó frissítés</p>
                    <div className="flex items-center gap-2 text-ivory/40 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>Most</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-[#150e03] border border-[#c9a56a]/10 p-10 flex flex-col justify-between hover:border-[#c9a56a]/30 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon className="h-32 w-32 -mr-16 -mt-16" />
                        </div>
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div className="p-3 bg-gold/5 rounded-lg border border-gold/10">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.4em] text-[#333333] font-black italic">Live Data</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-black text-[#fdfdf3] mb-2 tracking-tight">{stat.value}</p>
                            <p className="text-sm uppercase tracking-widest font-black text-ivory/60">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Quick Actions */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c9a56a]">Gyors Műveletek</h2>
                        <div className="h-[1px] flex-1 bg-gold/10"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link 
                            href="/admin/products" 
                            className="bg-[#c9a56a] text-[#150e03] p-8 font-black uppercase tracking-[0.3em] text-xs hover:bg-[#b08d55] transition-all flex flex-col items-center gap-6 shadow-2xl group"
                        >
                            <div className="p-4 bg-[#150e03]/10 rounded-full group-hover:scale-110 transition-transform">
                                <Plus className="h-6 w-6" />
                            </div>
                            <span>Új ékszer feltöltése</span>
                        </Link>
                        
                        <Link 
                            href="/admin/products?tool=pricing" 
                            className="bg-[#150e03] border border-[#c9a56a]/40 text-[#c9a56a] p-8 font-black uppercase tracking-[0.3em] text-xs hover:bg-[#c9a56a]/5 transition-all flex flex-col items-center gap-6 group"
                        >
                            <div className="p-4 bg-gold/5 rounded-full group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span>Százalékos áremelés</span>
                        </Link>

                        <Link 
                            id="collection-manage-btn"
                            href="/admin/products?tab=collections" 
                            className="bg-[#150e03] border border-[#c9a56a]/40 text-[#c9a56a] p-8 font-black uppercase tracking-[0.3em] text-xs hover:bg-[#c9a56a]/5 transition-all flex flex-col items-center gap-6 group"
                        >
                            <div className="p-4 bg-gold/5 rounded-full group-hover:scale-110 transition-transform">
                                <Layers className="h-6 w-6" />
                            </div>
                            <span>Kollekciók Kezelése</span>
                        </Link>

                        <Link 
                            href="/admin/texts" 
                            className="bg-ivory/5 border border-ivory/10 text-ivory/60 p-8 font-black uppercase tracking-[0.3em] text-xs hover:bg-ivory/10 transition-all flex flex-col items-center gap-6 group"
                        >
                            <Type className="h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <span>System Texts & Translations</span>
                        </Link>

                        <button 
                            onClick={() => setShowAnalytics(true)}
                            className="bg-gold/10 border border-gold/40 text-gold p-8 font-black uppercase tracking-[0.3em] text-xs hover:bg-gold/20 transition-all flex flex-col items-center gap-6 group sm:col-span-2 shadow-2xl shadow-gold/5"
                        >
                            <div className="p-4 bg-gold/10 rounded-full group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <span>Látogatottsági Statisztika Megnyitása</span>
                        </button>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c9a56a]">Legutóbbi Kollekciók</h2>
                        <div className="h-[1px] flex-1 bg-gold/10"></div>
                    </div>
                    
                    <div className="space-y-4">
                        {collections.length > 0 ? (
                            collections.slice(0, 4).map((c, idx) => (
                                <Link 
                                    key={idx} 
                                    href="/admin/products?tab=collections"
                                    className="flex items-center gap-6 p-4 bg-[#150e03]/30 border border-[#c9a56a]/5 hover:border-[#c9a56a]/30 transition-all group"
                                >
                                    <div className="h-16 w-12 bg-black border border-gold/10 flex items-center justify-center shrink-0 relative">
                                        <Layers className="h-6 w-6 text-gold/40 group-hover:text-gold transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[#fdfdf3] font-serif text-base tracking-wide truncate group-hover:text-gold transition-colors">{c.name}</h3>
                                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#666666] font-bold">
                                            {products.filter(p => p.collectionId === c.id).length} Termék
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <ExternalLink className="h-4 w-4 text-gold/20 group-hover:text-gold transition-colors" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-10 border border-dashed border-gold/10 text-center space-y-4">
                                <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Még nincsenek kollekciók</p>
                                <Link href="/admin/products?tab=collections" className="inline-block text-gold text-[11px] uppercase tracking-widest font-black border-b border-gold/20 pb-1 hover:border-gold transition-all">
                                    Első kollekció létrehozása
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vacation Mode Settings */}
            <div className="space-y-8 pt-8 border-t border-gold/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c9a56a]">Rendszer Beállítások</h2>
                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                </div>

                <div className={`p-8 border transition-all ${vacationMode.isActive ? 'bg-red-900/10 border-red-500/30' : 'bg-[#150e03]/30 border-gold/10'} flex flex-col md:flex-row gap-8 items-start md:items-center justify-between`}>
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-4">
                            <input 
                                type="checkbox"
                                id="vacationToggle"
                                checked={vacationMode.isActive}
                                onChange={(e) => setVacationMode({ ...vacationMode, isActive: e.target.checked })}
                                className="w-6 h-6 accent-red-500 cursor-pointer"
                            />
                            <label htmlFor="vacationToggle" className={`text-base uppercase tracking-widest font-black cursor-pointer ${vacationMode.isActive ? 'text-red-400' : 'text-gold'}`}>
                                Szabadság Mód Bekapcsolása
                            </label>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-ivory/50 leading-relaxed font-bold">
                            Ha aktív, a weboldal tetején és a termékoldalokon megjelenik, hogy szabadságon vagytok, és nem érvényes a 10 napos standard elkészítési idő.
                        </p>
                    </div>

                    {vacationMode.isActive && (
                        <div className="space-y-2 w-full md:w-auto">
                            <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">Várható kezdés (nap/dátum)</label>
                            <input 
                                type="text"
                                placeholder="pl: augusztus 25."
                                value={vacationMode.returnDate}
                                onChange={(e) => setVacationMode({ ...vacationMode, returnDate: e.target.value })}
                                className="w-full md:w-64 bg-black/50 border border-red-500/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-red-400"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Shipping Settings */}
            <div className="space-y-8 pt-8 border-t border-gold/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c9a56a]">Szállítási Beállítások</h2>
                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 border border-gold/10 bg-[#150e03]/30 space-y-6">
                        <div className="flex items-center gap-4 border-b border-gold/10 pb-4">
                            <input 
                                type="checkbox"
                                id="foxpostToggle"
                                checked={shippingSettings?.foxpostEnabled ?? true}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, foxpostEnabled: e.target.checked })}
                                className="w-6 h-6 accent-gold cursor-pointer"
                            />
                            <label htmlFor="foxpostToggle" className="text-base uppercase tracking-widest font-black cursor-pointer text-gold">
                                Foxpost Csomagautomata Bekapcsolása
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">Foxpost Díj (Ft)</label>
                            <input 
                                type="number"
                                value={shippingSettings?.foxpostPrice ?? 1500}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, foxpostPrice: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black/50 border border-gold/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
                            />
                        </div>
                    </div>

                    <div className="p-8 border border-gold/10 bg-[#150e03]/30 space-y-6">
                        <h3 className="text-base uppercase tracking-widest font-black text-gold border-b border-gold/10 pb-4">MPL Szállítási Díjak</h3>
                        <div className="space-y-6">
                            <div className="space-y-4 border-b border-gold/10 pb-4">
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="checkbox"
                                        id="mplHomeToggle"
                                        checked={shippingSettings?.mplHomeEnabled ?? true}
                                        onChange={(e) => updateShippingSettings({ ...shippingSettings, mplHomeEnabled: e.target.checked })}
                                        className="w-5 h-5 accent-gold cursor-pointer"
                                    />
                                    <label htmlFor="mplHomeToggle" className="text-xs uppercase tracking-widest font-black cursor-pointer text-[#fdfdf3]">
                                        Házhozszállítás bekapcsolása
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">MPL Házhozszállítás (Ft)</label>
                                    <input 
                                        type="number"
                                        value={shippingSettings?.mplHomePrice ?? 3000}
                                        onChange={(e) => updateShippingSettings({ ...shippingSettings, mplHomePrice: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-black/50 border border-gold/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="checkbox"
                                        id="mplBoxToggle"
                                        checked={shippingSettings?.mplBoxEnabled ?? true}
                                        onChange={(e) => updateShippingSettings({ ...shippingSettings, mplBoxEnabled: e.target.checked })}
                                        className="w-5 h-5 accent-gold cursor-pointer"
                                    />
                                    <label htmlFor="mplBoxToggle" className="text-xs uppercase tracking-widest font-black cursor-pointer text-[#fdfdf3]">
                                        Csomagautomata bekapcsolása
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">MPL Csomagautomata (Ft)</label>
                                    <input 
                                        type="number"
                                        value={shippingSettings?.mplBoxPrice ?? 3000}
                                        onChange={(e) => updateShippingSettings({ ...shippingSettings, mplBoxPrice: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-black/50 border border-gold/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 border border-gold/10 bg-[#150e03]/30 space-y-6 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-4 border-b border-gold/10 pb-4">
                            <input 
                                type="checkbox"
                                id="localPickupToggle"
                                checked={shippingSettings?.localPickupEnabled ?? true}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, localPickupEnabled: e.target.checked })}
                                className="w-6 h-6 accent-gold cursor-pointer"
                            />
                            <label htmlFor="localPickupToggle" className="text-base uppercase tracking-widest font-black cursor-pointer text-gold">
                                Személyes Átvétel Bekapcsolása
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">Személyes átvétel díja (Ft)</label>
                            <input 
                                type="number"
                                value={shippingSettings?.localPickupPrice ?? 0}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, localPickupPrice: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black/50 border border-gold/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
                            />
                        </div>
                    </div>

                    <div className="p-8 border border-gold/10 bg-[#150e03]/30 space-y-6 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-4 border-b border-gold/10 pb-4">
                            <input 
                                type="checkbox"
                                id="freeShippingToggle"
                                checked={shippingSettings?.freeShippingEnabled ?? true}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, freeShippingEnabled: e.target.checked })}
                                className="w-6 h-6 accent-gold cursor-pointer"
                            />
                            <label htmlFor="freeShippingToggle" className="text-base uppercase tracking-widest font-black cursor-pointer text-gold">
                                Ingyenes Szállítás Bekapcsolása
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-[#c9a56a] font-black block">Ingyenes szállítás értékhatára (Ft)</label>
                            <input 
                                type="number"
                                value={shippingSettings?.freeShippingThreshold ?? 20000}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black/50 border border-gold/30 text-ivory p-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
                            />
                            <p className="text-[10px] text-ivory/50 font-serif italic mt-1">Ezen összeg felett a vevőnek díjtalan a szállítás (pl. 20000).</p>
                        </div>
                    </div>

                    <div className="p-8 border border-gold/10 bg-[#150e03]/30 space-y-6 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-4 border-b border-gold/10 pb-4">
                            <input 
                                type="checkbox"
                                id="advancePaymentOnlyToggle"
                                checked={shippingSettings?.deliveryAdvancePaymentOnly ?? true}
                                onChange={(e) => updateShippingSettings({ ...shippingSettings, deliveryAdvancePaymentOnly: e.target.checked })}
                                className="w-6 h-6 accent-gold cursor-pointer"
                            />
                            <label htmlFor="advancePaymentOnlyToggle" className="text-base uppercase tracking-widest font-black cursor-pointer text-gold">
                                Kiszállításkor csak előreutalás
                            </label>
                        </div>
                        <p className="text-xs text-ivory/70 leading-relaxed font-serif italic">
                            Ideiglenes korlátozás: Kiszállítás választása esetén a vevő kizárólag előreutalással tud fizetni (nincs utánvét). Utánvét/helyszíni fizetés csak személyes átvételnél érhető el.
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Stones Availability */}
            <div className="space-y-8 pt-8 border-t border-gold/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c9a56a]">Elérhető Kövek Kezelése</h2>
                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                </div>
                
                <p className="text-xs uppercase tracking-widest text-[#999999] leading-relaxed font-bold">
                    Itt tudod kikapcsolni azokat a köveket, amelyek átmenetileg nincsenek raktáron. Amit itt kikapcsolsz, az egyik terméknél sem lesz választható!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from(new Set(allStonesMaster)).map(stoneKey => {
                        const isAvailable = availableStones.includes(stoneKey);
                        const price = stonePrices[stoneKey] ?? 0;
                        return (
                            <div
                                key={stoneKey}
                                className={`p-4 border transition-all flex flex-col items-center justify-between gap-3 relative group ${isAvailable ? 'border-gold bg-gold/10' : 'border-gold/10 bg-black/40 opacity-50 grayscale'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvailableStones(prev => isAvailable ? prev.filter(s => s !== stoneKey) : [...prev, stoneKey]);
                                    }}
                                    className="w-full h-full absolute inset-0 z-0 cursor-pointer"
                                />
                                
                                <div className="flex flex-col items-center gap-2 relative z-10 pointer-events-none">
                                    {editingNameKey === stoneKey ? (
                                        <div className="flex items-center gap-2 pointer-events-auto">
                                            <input 
                                                type="text"
                                                autoFocus
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        updateTranslation('HU', stoneKey, tempName);
                                                        // Also update EN as a fallback if it's the same
                                                        updateTranslation('EN', stoneKey, tempName);
                                                        setEditingNameKey(null);
                                                    }
                                                    if (e.key === 'Escape') setEditingNameKey(null);
                                                }}
                                                className="w-32 bg-black border border-gold/40 text-xs font-black text-gold p-1 outline-none text-center uppercase"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 pointer-events-auto cursor-pointer group/name" onClick={() => {
                                            setEditingNameKey(stoneKey);
                                            setTempName(t(stoneKey));
                                        }}>
                                            <span className={`text-xs uppercase tracking-widest font-black ${isAvailable ? 'text-gold' : 'text-ivory/40'}`}>
                                                {t(stoneKey)}
                                            </span>
                                            <Edit2 className="h-2 w-2 text-gold/20 group-hover/name:text-gold transition-colors" />
                                        </div>
                                    )}
                                    {editingStoneKey === stoneKey ? (
                                        <div className="flex items-center gap-2 pointer-events-auto">
                                            <div className="flex flex-col gap-2">
                                                <input 
                                                    type="number"
                                                    autoFocus
                                                    value={tempPrice}
                                                    onChange={(e) => setTempPrice(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const p = parseInt(tempPrice);
                                                            updateStonePrice(stoneKey, isNaN(p) ? 0 : p);
                                                            setEditingStoneKey(null);
                                                        }
                                                        if (e.key === 'Escape') setEditingStoneKey(null);
                                                    }}
                                                    className="w-20 bg-black border border-gold/40 text-xs font-black text-ivory p-1 outline-none"
                                                />
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateStonePrice(stoneKey, 0);
                                                        setEditingStoneKey(null);
                                                    }}
                                                    className="bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase py-1 hover:bg-gold hover:text-deep-brown transition-all"
                                                >
                                                    INGYEN
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 pointer-events-auto cursor-pointer group/price" onClick={() => {
                                            setEditingStoneKey(stoneKey);
                                            setTempPrice(price.toString());
                                        }}>
                                            <span className="text-[11px] font-bold text-ivory/60">{formatPrice(price)}</span>
                                            <Edit2 className="h-2 w-2 text-gold/20 group-hover/price:text-gold transition-colors" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 relative z-20 w-full mt-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAvailableStones(prev => isAvailable ? prev.filter(s => s !== stoneKey) : [...prev, stoneKey]);
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                                            isAvailable 
                                                ? 'bg-gold text-deep-brown hover:bg-gold/90' 
                                                : 'bg-black/60 border border-gold/30 text-gold/60 hover:text-gold hover:border-gold'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-deep-brown' : 'bg-gold/40'}`}></span>
                                        {isAvailable ? 'Elérhető' : 'Kikapcsolva'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Biztosan véglegesen törlöd ezt a követ?')) {
                                                deleteStone(stoneKey);
                                            }
                                        }}
                                        className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                                        title="Kő törlése"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={() => setIsAddingStone(true)}
                        className="p-4 border border-gold/40 border-dashed bg-gold/5 flex flex-col items-center justify-center gap-2 hover:bg-gold/10 transition-all text-gold group min-h-[120px]"
                    >
                        <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] uppercase tracking-widest font-black">Új kő</span>
                    </button>
                </div>

                {isAddingStone && (
                    <div className="mt-8 p-8 bg-black/40 border border-gold/20 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold">Új kő felvétele</h3>
                            <button onClick={() => setIsAddingStone(false)} className="text-ivory/40 hover:text-gold">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest text-[#999999] font-black block">Magyar név</label>
                                <input 
                                    type="text"
                                    placeholder="pl: Türkiz"
                                    value={newStoneHu}
                                    onChange={(e) => setNewStoneHu(e.target.value)}
                                    className="w-full bg-[#150e03]/50 border border-gold/10 p-4 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest text-[#999999] font-black block">Angol név (English)</label>
                                <input 
                                    type="text"
                                    placeholder="e.g.: Turquoise"
                                    value={newStoneEn}
                                    onChange={(e) => setNewStoneEn(e.target.value)}
                                    className="w-full bg-[#150e03]/50 border border-gold/10 p-4 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest text-[#999999] font-black block">Ár (Ft)</label>
                                <input 
                                    type="number"
                                    placeholder="3000"
                                    value={newStonePrice}
                                    onChange={(e) => setNewStonePrice(e.target.value)}
                                    className="w-full bg-[#150e03]/50 border border-gold/10 p-4 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => {
                                    const hu = newStoneHu.trim();
                                    if (!hu) {
                                        alert('Kérjük, adj meg egy nevet a kőnek!');
                                        return;
                                    }
                                    const en = newStoneEn.trim() || hu;
                                    addStone(hu, en, parseInt(newStonePrice) || 0);
                                    setNewStoneHu('');
                                    setNewStoneEn('');
                                    setNewStonePrice('3000');
                                    setIsAddingStone(false);
                                }}
                                className="bg-gold text-deep-brown px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                Hozzáadás
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ANALYTICS MODAL OVERLAY */}
            <AnimatePresence>
                {showAnalytics && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl transition-all">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#150e03] border border-gold/30 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(201,165,106,0.1)]"
                        >
                            {/* Header */}
                            <div className="p-10 border-b border-gold/10 flex justify-between items-center bg-gold/[0.02]">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <BarChart3 className="h-5 w-5 text-gold" />
                                        <h2 className="text-2xl font-serif text-ivory tracking-[0.2em] uppercase">Rendszer Statisztika</h2>
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setAnalyticsTab('sales')}
                                            className={`px-6 py-2 text-xs font-black uppercase tracking-widest border transition-all ${analyticsTab === 'sales' ? 'bg-gold text-deep-brown border-gold' : 'text-gold/60 border-gold/20 hover:border-gold/40'}`}
                                        >
                                            Értékesítés
                                        </button>
                                        <button 
                                            onClick={() => setAnalyticsTab('traffic')}
                                            className={`px-6 py-2 text-xs font-black uppercase tracking-widest border transition-all ${analyticsTab === 'traffic' ? 'bg-gold text-deep-brown border-gold' : 'text-gold/60 border-gold/20 hover:border-gold/40'}`}
                                        >
                                            Weboldal Forgalom
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAnalytics(false)}
                                    className="bg-gold/5 p-4 rounded-full text-gold/40 hover:text-gold hover:bg-gold/10 transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                                {analyticsTab === 'traffic' ? (
                                    <>
                                        {/* Real Traffic Stats Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            {[
                                                { label: 'Összes Oldalmegtekintés', value: trafficStats.totalViews.toLocaleString('hu-HU'), icon: Users, color: 'text-gold' },
                                                { label: 'Egyedi Látogatók', value: trafficStats.uniqueVisits.toLocaleString('hu-HU'), icon: Globe, color: 'text-emerald-400' },
                                                { label: 'Mobil látogatók', value: `${trafficStats.devices?.mobile || 0} (${trafficStats.totalViews > 0 ? Math.round(((trafficStats.devices?.mobile || 0) / trafficStats.totalViews) * 100) : 0}%)`, icon: TrendingUp, color: 'text-gold/80' },
                                                { label: 'Asztali (PC/Laptop)', value: `${trafficStats.devices?.desktop || 0} (${trafficStats.totalViews > 0 ? Math.round(((trafficStats.devices?.desktop || 0) / trafficStats.totalViews) * 100) : 0}%)`, icon: Clock, color: 'text-blue-400' }
                                            ].map((s, idx) => (
                                                <div key={idx} className="bg-black/40 border border-gold/20 p-6 space-y-4 rounded-xl shadow-lg">
                                                    <div className="flex justify-between items-start">
                                                        <s.icon className={`h-4 w-4 ${s.color}`} />
                                                        <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">Valódi Adat</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-ivory tracking-tight">{s.value}</p>
                                                        <p className="text-[11px] font-black text-gold/60 uppercase tracking-widest mt-1">{s.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Direct Link to MediaCenter Server Stats */}
                                        <div className="p-6 bg-gold/5 border border-gold/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="space-y-1 text-center sm:text-left">
                                                <h4 className="text-xs uppercase font-black tracking-widest text-gold">Hivatalos Szerver Statisztikák (MediaCenter AWStats / Webalizer)</h4>
                                                <p className="text-[11px] text-ivory/60">A tárhelyeden a szerver szintű IP és látogatói forgalom automatikusan naplózódik a MediaCenter Ügyfélkapuban.</p>
                                            </div>
                                            <a 
                                                href="https://admin.mediacenter.hu/index_stats.php" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-gold text-deep-brown font-black text-xs uppercase tracking-widest rounded-lg hover:bg-gold/80 transition-all shadow-lg shrink-0"
                                            >
                                                Szerver Statisztika Megnyitása ↗
                                            </a>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            {/* Daily Traffic Chart */}
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Napi látogatók száma (Múlt hét)</h3>
                                                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                                                </div>
                                                <div className="h-64 flex items-end justify-between gap-4 px-4 relative">
                                                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gold/20"></div>
                                                    {[142, 185, 220, 195, 240, 310, 285].map((val, idx) => {
                                                        const days = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
                                                        const height = (val / 350) * 100;
                                                        return (
                                                            <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                                                                <div className="w-full relative">
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gold text-deep-brown text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {val}
                                                                    </div>
                                                                    <div 
                                                                        className="w-full bg-gold/10 border-t-2 border-gold/40 group-hover:bg-gold/30 group-hover:border-gold transition-all duration-500"
                                                                        style={{ height: `${height}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-[11px] font-black text-[#666666] uppercase tracking-widest">{days[idx]}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Countries Breakdown */}
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Országok szerinti bontás</h3>
                                                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                                                </div>
                                                <div className="space-y-5">
                                                    {[
                                                        { country: 'Magyarország', count: '12,402', flag: '🇭🇺', pct: 82 },
                                                        { country: 'Románia', count: '1,245', flag: '🇷🇴', pct: 8 },
                                                        { country: 'Szlovákia', count: '845', flag: '🇸🇰', pct: 5 },
                                                        { country: 'Egyéb', count: '620', flag: '🌍', pct: 5 }
                                                    ].map((c, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase">
                                                                <span className="text-ivory flex items-center gap-3">
                                                                    <span className="text-lg opacity-80">{c.flag}</span>
                                                                    {c.country}
                                                                </span>
                                                                <span className="text-gold">{c.count}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-black/40 overflow-hidden">
                                                                <div className="h-full bg-gold shadow-[0_0_100px_rgba(201,165,106,0.3)] transition-all duration-1000" style={{ width: `${c.pct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Peak Hours Heatmap */}
                                        <div className="space-y-8 pb-12">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Látogatottsági Intenzitás (24 óra)</h3>
                                                <div className="h-[1px] flex-1 bg-gold/10"></div>
                                            </div>
                                            <div 
                                                className="grid gap-1.5" 
                                                style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                                            >
                                                {Array.from({ length: 24 }).map((_, hour) => {
                                                    const intensity = hour < 6 ? 10 : hour < 9 ? 30 : hour < 17 ? 60 : hour < 22 ? 100 : 40;
                                                    const opacity = (intensity / 100);
                                                    return (
                                                        <div key={hour} className="group relative">
                                                            <div 
                                                                className="h-16 border border-gold/10 hover:border-gold transition-all"
                                                                style={{ backgroundColor: `rgba(201,165,106, ${opacity * 0.4})` }}
                                                            ></div>
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-gold/30 text-[10px] text-gold font-black px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                                                                {hour}:00
                                                            </div>
                                                            {hour % 4 === 0 && (
                                                                <span className="absolute -bottom-6 left-0 text-[10px] font-black text-[#444] uppercase tracking-tighter">
                                                                    {hour}:00
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Sales Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="bg-gold/5 border border-gold/20 p-8 space-y-4 shadow-2xl">
                                                <DollarSign className="h-6 w-6 text-gold" />
                                                <div>
                                                    <p className="text-3xl font-black text-ivory tracking-tighter">{formatPrice(totalRevenue)}</p>
                                                    <p className="text-xs font-black text-gold/40 uppercase tracking-[0.3em] mt-2">Összesített árbevétel</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 p-8 space-y-4">
                                                <ShoppingBag className="h-6 w-6 text-ivory/60" />
                                                <div>
                                                    <p className="text-3xl font-black text-ivory tracking-tighter">{orders.length}</p>
                                                    <p className="text-xs font-black text-ivory/20 uppercase tracking-[0.3em] mt-2">Összes megrendelés</p>
                                                </div>
                                            </div>
                                            <div className="bg-gold/10 border border-gold/30 p-8 space-y-4">
                                                <Star className="h-6 w-6 text-gold" />
                                                <div>
                                                    <p className="text-3xl font-black text-gold tracking-tighter">{bestSellers[0]?.[0] || '-'}</p>
                                                    <p className="text-xs font-black text-gold/40 uppercase tracking-[0.3em] mt-2">Legnépszerűbb termék</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            {/* Best Sellers List */}
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-4 justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Legtöbbet eladott</h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setBestSellersTab('month')}
                                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${bestSellersTab === 'month' ? 'bg-gold text-deep-brown border-gold' : 'text-gold/60 border-gold/20 hover:border-gold/40'}`}
                                                        >
                                                            E Havi
                                                        </button>
                                                        <button 
                                                            onClick={() => setBestSellersTab('all')}
                                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${bestSellersTab === 'all' ? 'bg-gold text-deep-brown border-gold' : 'text-gold/60 border-gold/20 hover:border-gold/40'}`}
                                                        >
                                                            Összes
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="h-[1px] w-full bg-gold/10 -mt-4"></div>
                                                <div className="space-y-4">
                                                    {(bestSellersTab === 'all' ? bestSellers : monthlyBestSellers).length > 0 ? (
                                                        (bestSellersTab === 'all' ? bestSellers : monthlyBestSellers).map(([name, data], idx) => (
                                                            <div key={idx} className="flex items-center gap-6 p-4 bg-black/40 border border-gold/5 hover:border-gold/20 transition-all group">
                                                                <div className="h-14 w-14 bg-black shrink-0 relative overflow-hidden">
                                                                    {data.image ? (
                                                                        <img src={data.image} alt={name} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                                    ) : (
                                                                        <Package className="h-6 w-6 text-gold/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-base font-serif text-ivory truncate">{name}</h4>
                                                                    <p className="text-[11px] uppercase tracking-widest text-[#666666] font-bold mt-1">{formatPrice(data.revenue)} össz. bevétel</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xl font-black text-gold tracking-tighter">{data.quantity} db</p>
                                                                    <p className="text-[10px] uppercase font-black text-gold/20 tracking-tighter">Értékesítve</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs uppercase tracking-widest text-[#444] font-black text-center py-20 italic">Még nincsenek értékesítési adatok</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Monthly Breakdown */}
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Havi összesítő</h3>
                                                    <div className="h-[1px] flex-1 bg-gold/10"></div>
                                                </div>
                                                <div className="space-y-3">
                                                    {sortedMonths.length > 0 ? (
                                                        sortedMonths.map(([month, data], idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-6 bg-gold/[0.02] border border-gold/5">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-black text-ivory uppercase tracking-[0.2em]">{month}</p>
                                                                    <p className="text-[11px] text-[#666666] font-bold uppercase tracking-widest">{data.orders} megrendelés</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-black text-gold tracking-tighter">{formatPrice(data.revenue)}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs uppercase tracking-widest text-[#444] font-black text-center py-20 italic">Még nincsenek havi adatok</p>
                                                    )}
                                                </div>

                                                {/* Yearly Summary */}
                                                <div className="pt-8 space-y-8">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Éves összesítő</h3>
                                                        <div className="h-[1px] flex-1 bg-gold/10"></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {Object.entries(yearlySales).sort((a, b) => b[0].localeCompare(a[0])).map(([year, data], idx) => (
                                                            <div key={idx} className="p-6 bg-black/60 border border-gold/20 rounded-xl">
                                                                <p className="text-base font-black text-gold/60 mb-2">{year}</p>
                                                                <p className="text-xl font-black text-ivory tracking-tighter">{formatPrice(data.revenue)}</p>
                                                                <p className="text-[11px] text-[#444] font-black uppercase tracking-widest mt-1">{data.orders} rendelés</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Who Ordered What Breakdown */}
                                        <div className="space-y-6 pt-6 border-t border-gold/10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold">Ki mit rendelt? (Összes vásárlás)</h3>
                                                    <span className="text-[11px] font-bold text-ivory/40">({orders.length} db)</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Keresés vevő vagy ékszer neve alapján..."
                                                    value={salesSearch}
                                                    onChange={(e) => setSalesSearch(e.target.value)}
                                                    className="bg-[#0d0902] border border-gold/20 px-4 py-2 text-xs text-ivory placeholder-ivory/30 outline-none focus:border-gold w-full sm:w-80 rounded"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                {(() => {
                                                    const q = salesSearch.trim().toLowerCase();
                                                    const filtered = orders.filter((o: any) => {
                                                        if (!q) return true;
                                                        const custName = (o.customerInfo?.fullName || '').toLowerCase();
                                                        const custEmail = (o.customerInfo?.email || '').toLowerCase();
                                                        const itemsText = (o.items || []).map((i: any) => `${i.name || ''} ${i.selectedCustomization || ''}`).join(' ').toLowerCase();
                                                        return custName.includes(q) || custEmail.includes(q) || itemsText.includes(q);
                                                    });

                                                    if (filtered.length === 0) {
                                                        return (
                                                            <p className="text-xs uppercase tracking-widest text-[#555] font-black text-center py-12 italic">
                                                                Nincs találat a vásárlások között
                                                            </p>
                                                        );
                                                    }

                                                    return filtered.map((order: any, idx: number) => {
                                                        const shippingMethodName = order.shippingInfo?.method || order.shipping?.method || '';
                                                        const isPickup = order.shippingType === 'local-pickup'
                                                            || order.shippingInfo?.type === 'local-pickup'
                                                            || shippingMethodName.toLowerCase().includes('személyes')
                                                            || shippingMethodName.toLowerCase().includes('üzlet');
                                                        return (
                                                            <div key={order.id || idx} className="p-5 bg-black/40 border border-gold/10 hover:border-gold/30 rounded-xl space-y-4 transition-all">
                                                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gold/10 pb-3">
                                                                    <div className="space-y-1">
                                                                        <p className="text-base font-serif text-ivory font-bold">
                                                                            {order.customerInfo?.fullName || 'Vendég'}
                                                                        </p>
                                                                        <p className="text-[11px] text-ivory/50">
                                                                            {order.customerInfo?.email || '-'}{order.customerInfo?.phone ? ` • ${order.customerInfo.phone}` : ''}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right space-y-1">
                                                                        <p className="text-lg font-black text-gold">{formatPrice(Number(order.total) || 0)}</p>
                                                                        <p className="text-[10px] text-ivory/40 uppercase tracking-wider">
                                                                            {order.date ? new Date(order.date).toLocaleString('hu-HU') : '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(order.items || []).map((item: any, iIdx: number) => (
                                                                        <div key={iIdx} className="flex items-center justify-between gap-4 text-xs bg-white/[0.03] px-3 py-2 rounded">
                                                                            <div className="min-w-0">
                                                                                <span className="font-bold text-ivory">{item.name}</span>
                                                                                {item.selectedCustomization && (
                                                                                    <span className="text-gold/80 italic ml-2">({item.selectedCustomization})</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="shrink-0 text-right text-ivory/70">
                                                                                <span className="font-bold">{item.quantity || 1} db</span> • <span className="text-gold">{formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] uppercase font-bold tracking-wider">
                                                                    <span className="px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                                                                        {isPickup ? 'Helybeni átvétel (Üzletben)' : `Szállítás: ${shippingMethodName || 'Házhozszállítás'}`}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded bg-white/5 text-ivory/70 border border-white/10">
                                                                        {order.paymentMethod || 'Előre utalás'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-gold/10 flex justify-end gap-6 bg-gold/[0.01]">
                                <button 
                                    onClick={() => setShowAnalytics(false)}
                                    className="bg-gold text-deep-brown px-12 py-4 rounded-md text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] shadow-xl"
                                >
                                    Bezárás
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
