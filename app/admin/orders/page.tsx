"use client";

import React, { useState } from 'react';
import { useAuth, Order } from '@/components/AuthProvider';
import { useConfig } from '@/components/ConfigProvider';
import { 
    ShoppingBag, 
    User, 
    MapPin, 
    CreditCard, 
    Calendar,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    CheckCircle2,
    Truck,
    Clock,
    Copy,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
    const { allOrders: orders, updateOrderStatus, markOrderAsViewed } = useAuth();
    const { formatPrice, t, addNotification } = useConfig();
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const toggleOrder = (id: string) => {
        if (expandedOrder !== id) {
            markOrderAsViewed(id);
        }
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-gold bg-gold/5 border-gold/20';
            case 'shipped': return 'text-blue-400 bg-blue-400/5 border-blue-400/20';
            case 'delivered': return 'text-green-400 bg-green-400/5 border-green-400/20';
            default: return 'text-ivory/40 bg-ivory/5 border-ivory/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return Clock;
            case 'shipped': return Truck;
            case 'delivered': return CheckCircle2;
            default: return Clock;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Megrendelések</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">Sales & Invoicing Management</p>
                </div>
                <div className="bg-gold/5 border border-gold/10 px-6 py-3 rounded-full flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-gold" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#fdfdf3]">
                        {orders.length} Rendelés összesen
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="p-20 border border-dashed border-gold/10 text-center space-y-4">
                        <ShoppingBag className="h-12 w-12 text-gold/20 mx-auto" />
                        <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Még nincsenek rendelések</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const StatusIcon = getStatusIcon(order.status);
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`bg-[#150e03] border transition-all ${isExpanded ? 'border-gold shadow-2xl scale-[1.01]' : 'border-gold/10 hover:border-gold/30'}`}
                            >
                                {/* Order Header - SLEEK & COMPACT LIST ROW */}
                                <div 
                                    className="p-4 flex items-center justify-between cursor-pointer group hover:bg-gold/5 transition-colors"
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center py-2 px-3 bg-gold/5 border border-gold/10 w-20 shrink-0">
                                            <span className="text-[6px] uppercase font-black text-gold/40 mb-0.5">Dátum</span>
                                            <span className="text-[11px] font-bold text-ivory/80">{new Date(order.date).toLocaleDateString('hu-HU')}</span>
                                        </div>

                                        <div className="flex items-center gap-6 min-w-0">
                                            <h3 className="text-base font-serif text-ivory/60 tracking-wider group-hover:text-gold transition-colors truncate max-w-[200px]">
                                                {order.customerInfo?.fullName || 'Vendég'}
                                            </h3>
                                            
                                            <div className="hidden lg:flex items-center gap-3 border-l border-gold/10 pl-6">
                                                <p className="text-[10px] uppercase tracking-widest text-[#444444] font-bold">
                                                    ID: <span className="text-ivory/30">{order.id}</span>
                                                </p>
                                                <div className={`px-2 py-0.5 rounded-[4px] text-[7px] uppercase font-black border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                    <StatusIcon className="h-2.5 w-2.5" />
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-gold tracking-tight">{formatPrice(order.total)}</p>
                                            <p className="text-[7px] uppercase tracking-widest text-[#444444] font-bold mt-0.5">{order.items.length} db • {order.paymentMethod || 'Utánvét'}</p>
                                        </div>
                                        <div className={`p-1.5 rounded-full transition-all ${isExpanded ? 'bg-gold/10 text-gold rotate-180' : 'text-gold/20 group-hover:text-gold/40'}`}>
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-gold/10 bg-black/40"
                                        >
                                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                {/* Left Column: Customer & Items */}
                                                <div className="space-y-10">
                                                    <div className="space-y-6">
                                                        <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black border-b border-gold/10 pb-4 flex items-center gap-3">
                                                            <User className="h-3 w-3" />
                                                            Vevő adatai
                                                        </h4>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-4">
                                                                    <Mail className="h-4 w-4 text-[#666666]" />
                                                                    <span className="text-sm text-ivory/80">{order.customerInfo?.email}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.email)} className="opacity-0 group-hover:opacity-100 p-2 text-gold/40 hover:text-gold transition-all">
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-4">
                                                                    <Phone className="h-4 w-4 text-[#666666]" />
                                                                    <span className="text-sm text-ivory/80">{order.customerInfo?.phone}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.phone)} className="opacity-0 group-hover:opacity-100 p-2 text-gold/40 hover:text-gold transition-all">
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black border-b border-gold/10 pb-4">Megrendelt termékek</h4>
                                                        <div className="space-y-4">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-6 p-4 bg-white/5 border border-white/5 group hover:border-gold/20 transition-all">
                                                                    <div className="h-16 w-16 bg-black relative shrink-0">
                                                                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h5 className="text-base font-serif text-ivory">{item.name}</h5>
                                                                        <p className="text-xs text- gold/60 mt-1 italic">{item.selectedCustomization}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm text-ivory font-bold">{item.quantity} db</p>
                                                                        <p className="text-xs text-[#666666] mt-1">{formatPrice(item.price)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="pt-6 border-t border-gold/10 flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-bold">Szállítási mód</p>
                                                                <p className="text-sm text-ivory mt-1">{order.shippingInfo?.method || 'Standard'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[11px] uppercase tracking-widest text-[#666666] font-bold">Végösszeg</p>
                                                                <p className="text-2xl font-black text-gold tracking-tighter">{formatPrice(order.total)}</p>
                                                            </div>
                                                        </div>
                                                        {order.comment && (
                                                            <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded">
                                                                <p className="text-[11px] uppercase tracking-[0.3em] text-orange-400 font-black mb-2">Megjegyzés a rendeléshez:</p>
                                                                <p className="text-sm text-ivory/80 italic">{order.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column: Invoicing Data (Crucial for user) */}
                                                <div className="space-y-10">
                                                    <div className="bg-gold/5 border border-gold/20 p-10 space-y-10 shadow-inner">
                                                        {/* Shipping Data */}
                                                        <div className="space-y-6">
                                                            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                                                                <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black flex items-center gap-3">
                                                                    <MapPin className="h-3 w-3" />
                                                                    Szállítási cím
                                                                </h4>
                                                                <button 
                                                                    onClick={() => copyToClipboard(`${order.shippingInfo?.postcode} ${order.shippingInfo?.city}, ${order.shippingInfo?.address}`)}
                                                                    className="text-[11px] uppercase font-black text-gold/40 hover:text-gold flex items-center gap-2 transition-all"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                    Cím másolása
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2 text-ivory/80 text-base font-serif">
                                                                <p className="text-sm font-black uppercase tracking-widest text-ivory">{order.customerInfo?.fullName}</p>
                                                                <p>{order.shippingInfo?.postcode} {order.shippingInfo?.city}</p>
                                                                <p>{order.shippingInfo?.address}</p>
                                                            </div>
                                                        </div>

                                                        {/* Billing Data - THE MOST IMPORTANT FOR INVOICING */}
                                                        <div className="space-y-6 pt-6 border-t border-gold/10">
                                                            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                                                                <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black flex items-center gap-3">
                                                                    <Building2 className="h-3 w-3" />
                                                                    Számlázási adatok
                                                                </h4>
                                                                <button 
                                                                    onClick={() => {
                                                                        const b = order.billingInfo;
                                                                        copyToClipboard(`${b?.name}\n${b?.postcode} ${b?.city}\n${b?.address}${b?.taxNumber ? `\nAdószám: ${b.taxNumber}` : ''}`);
                                                                    }}
                                                                    className="text-[11px] uppercase font-black text-gold/40 hover:text-gold flex items-center gap-2 transition-all"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                    Összes adat másolása
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {order.billingInfo?.isCompany && (
                                                                    <div className="px-2 py-1 bg-gold/10 border border-gold/20 inline-block rounded text-[10px] font-black uppercase tracking-widest text-gold mb-2">
                                                                        Céges számla
                                                                    </div>
                                                                )}
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-black uppercase tracking-widest text-ivory">{order.billingInfo?.name}</p>
                                                                    <p className="text-base font-serif text-ivory/80">{order.billingInfo?.postcode} {order.billingInfo?.city}</p>
                                                                    <p className="text-base font-serif text-ivory/80">{order.billingInfo?.address}</p>
                                                                </div>
                                                                {order.billingInfo?.taxNumber && (
                                                                    <div className="pt-4 flex items-center gap-4">
                                                                        <span className="text-xs font-black uppercase tracking-widest text-[#666666]">Adószám:</span>
                                                                        <span className="text-sm font-serif text-gold font-bold select-all tracking-widest">{order.billingInfo.taxNumber}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Admin Actions */}
                                                    <div className="space-y-4 pt-10">
                                                        <h4 className="text-[11px] uppercase tracking-[0.4em] text-[#666666] font-black">Állapot módosítása</h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {['pending', 'shipped', 'delivered'].map((s) => (
                                                                <button 
                                                                    key={s}
                                                                    onClick={() => {
                                                                        updateOrderStatus(order.id, s as any);
                                                                        // Optional: give visual feedback
                                                                    }}
                                                                    className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest border transition-all ${order.status === s ? getStatusColor(s) : 'border-white/5 text-[#444] hover:border-white/10 hover:text-white/40'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
