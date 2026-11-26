"use client";

import React, { useState, useEffect } from 'react';
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
    Phone,
    RefreshCw,
    AlertCircle,
    Check,
    Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
    const { allOrders: localOrders, updateOrderStatus: updateLocalOrderStatus, markOrderAsViewed } = useAuth();
    const { formatPrice, t, addNotification, products } = useConfig();
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [viewedOrderIds, setViewedOrderIds] = useState<string[]>([]);
    const [serverOrders, setServerOrders] = useState<any[]>([]);
    const [isCheckingBank, setIsCheckingBank] = useState(false);
    const [bankCheckMessage, setBankCheckMessage] = useState<string | null>(null);
    const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

    // Load locally remembered viewed orders on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('magyarekszer_viewed_orders');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setViewedOrderIds(parsed);
            }
        } catch (e) {}
    }, []);

    // Fetch server orders
    const fetchServerOrders = async () => {
        try {
            const res = await fetch('/api/orders.php?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.orders)) {
                    setServerOrders(data.orders);
                }
            }
        } catch (e) {
            // Local fallback
        }
    };

    useEffect(() => {
        fetchServerOrders();
    }, []);

    // Merge server and local orders (avoiding duplicates)
    const combinedOrders: any[] = React.useMemo(() => {
        if (serverOrders.length > 0) {
            return serverOrders;
        }
        return localOrders;
    }, [serverOrders, localOrders]);

    const toggleOrder = (id: string) => {
        if (expandedOrder !== id) {
            markOrderAsViewed(id);
            setViewedOrderIds(prev => {
                if (prev.includes(id)) return prev;
                const next = [...prev, id];
                try {
                    localStorage.setItem('magyarekszer_viewed_orders', JSON.stringify(next));
                } catch (e) {}
                return next;
            });
            // Persist viewed state on server as well
            fetch('/api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id, viewed: true })
            }).catch(() => {});
        }
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
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

    // Trigger K&H email scan
    const handleCheckKhEmails = async () => {
        setIsCheckingBank(true);
        setBankCheckMessage(null);
        try {
            const res = await fetch('/api/check-kh-emails.php');
            const data = await res.json();
            if (data.success) {
                setBankCheckMessage(data.message || 'Az ellenőrzés lefutott.');
                fetchServerOrders();
            } else {
                setBankCheckMessage('Nem sikerült lekérni a banki emaileket.');
            }
        } catch (err) {
            setBankCheckMessage('Hiba történt az ellenőrzés során.');
        } finally {
            setIsCheckingBank(false);
        }
    };

    // Toggle Payment Status
    const handleUpdatePayment = async (orderId: string, targetStatus: 'paid' | 'pending') => {
        setUpdatingPaymentId(orderId);
        try {
            const res = await fetch('/api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    paymentStatus: targetStatus,
                    paidVia: targetStatus === 'paid' ? 'Kézi jóváhagyás az adminban' : null
                })
            });
            if (res.ok) {
                await fetchServerOrders();
            }
        } catch (e) {
            console.error('Failed to update payment status:', e);
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    // Update Fulfillment Status
    const handleUpdateFulfillment = async (orderId: string, status: any) => {
        updateLocalOrderStatus(orderId, status);
        try {
            await fetch('/api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            });
            fetchServerOrders();
        } catch (e) {}
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Megrendelések</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">Sales & Bank Transfer Synchronization</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* K&H Bank Sync Button */}
                    <button
                        onClick={handleCheckKhEmails}
                        disabled={isCheckingBank}
                        className="bg-[#1a1104] hover:bg-gold/20 border border-gold/30 hover:border-gold px-5 py-3 rounded-full flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(201,165,106,0.15)] group disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-gold ${isCheckingBank ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#fdfdf3]">
                            {isCheckingBank ? 'K&H Emailek ellenőrzése...' : 'K&H Utalások ellenőrzése'}
                        </span>
                    </button>

                    <div className="bg-gold/5 border border-gold/10 px-5 py-3 rounded-full flex items-center gap-2.5">
                        <ShoppingBag className="h-4 w-4 text-gold" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#fdfdf3]">
                            {combinedOrders.length} Rendelés
                        </span>
                    </div>
                </div>
            </div>

            {/* Notification message from Bank check */}
            {bankCheckMessage && (
                <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-between text-xs text-[#fdfdf3]">
                    <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-gold shrink-0" />
                        <span>{bankCheckMessage}</span>
                    </div>
                    <button onClick={() => setBankCheckMessage(null)} className="text-gold/60 hover:text-gold uppercase tracking-wider text-[10px] font-bold">
                        Bezárás
                    </button>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-6">
                {combinedOrders.length === 0 ? (
                    <div className="p-20 border border-dashed border-gold/10 text-center space-y-4">
                        <ShoppingBag className="h-12 w-12 text-gold/20 mx-auto" />
                        <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Még nincsenek rendelések</p>
                    </div>
                ) : (
                    combinedOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const isViewed = Boolean(order.viewed) || viewedOrderIds.includes(order.id);
                        const StatusIcon = getStatusIcon(order.status || 'pending');
                        const isBankTransfer = (order.paymentMethod || '').toLowerCase().includes('utal');
                        const isPaid = order.paymentStatus === 'paid';
                        const shippingMethodName = order.shippingInfo?.method || order.shipping?.method || '';
                        const isLocalPickup = order.shippingType === 'local-pickup'
                            || order.shippingInfo?.type === 'local-pickup'
                            || order.shipping?.type === 'local-pickup'
                            || shippingMethodName.toLowerCase().includes('személyes')
                            || shippingMethodName.toLowerCase().includes('üzlet')
                            || shippingMethodName.toLowerCase().includes('pickup');
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`rounded-xl border transition-all overflow-hidden ${
                                    isExpanded
                                        ? 'bg-[#20160a] border-gold ring-2 ring-gold/60 shadow-[0_0_40px_rgba(201,165,106,0.22)]'
                                        : isViewed
                                            ? 'bg-emerald-950/35 border-emerald-500/45 border-l-4 border-l-emerald-400 hover:border-emerald-400/80'
                                            : 'bg-[#150e03] border-gold/25 border-l-4 border-l-gold hover:border-gold/60'
                                }`}
                            >
                                {/* Order Header */}
                                <div 
                                    className={`p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer group transition-colors ${
                                        isExpanded
                                            ? 'bg-gold/15'
                                            : isViewed
                                                ? 'hover:bg-emerald-500/10'
                                                : 'hover:bg-gold/10'
                                    }`}
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                                        <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg border w-24 shrink-0 ${
                                            isViewed ? 'bg-emerald-500/15 border-emerald-500/35' : 'bg-gold/10 border-gold/25'
                                        }`}>
                                            <span className={`text-[8px] uppercase font-black mb-0.5 ${isViewed ? 'text-emerald-300' : 'text-gold/80'}`}>Dátum</span>
                                            <span className="text-xs font-bold text-[#fdfdf3]">
                                                {order.date ? new Date(order.date).toLocaleDateString('hu-HU') : '-'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                                                <h3 className={`text-lg font-serif tracking-wide transition-colors truncate max-w-[220px] sm:max-w-[300px] ${
                                                    isViewed ? 'text-emerald-200 group-hover:text-emerald-100' : 'text-[#fdfdf3] group-hover:text-gold'
                                                }`}>
                                                    {order.customerInfo?.fullName || 'Vendég'}
                                                </h3>
                                                {isViewed ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1 shrink-0">
                                                        <Check className="h-2.5 w-2.5" /> Megnyitva
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider bg-amber-500/25 text-amber-200 border border-amber-400/50 shrink-0">
                                                        Új rendelés
                                                    </span>
                                                )}
                                                <p className="hidden xl:block text-[10px] uppercase tracking-widest text-ivory/50 font-bold">
                                                    ID: <span className="text-ivory/80">{order.id}</span>
                                                </p>
                                            </div>
                                            
                                            {/* Always visible Shipping + Payment + Status pills */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Shipping vs Local Pickup Pill */}
                                                {isLocalPickup ? (
                                                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                                        <MapPin className="h-2.5 w-2.5" /> Helybeni átvétel (Üzletben)
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                                                        <Truck className="h-2.5 w-2.5" /> Szállítás{shippingMethodName ? `: ${shippingMethodName}` : ''}
                                                    </span>
                                                )}

                                                {/* Payment Method & Status Pill */}
                                                {isBankTransfer ? (
                                                    isPaid ? (
                                                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                            <Check className="h-2.5 w-2.5" /> Előre utalás • Fizetve
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                                            <Clock className="h-2.5 w-2.5" /> Előre utalás • Utalásra vár
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                                                        <CreditCard className="h-2.5 w-2.5" /> Utánvét
                                                    </span>
                                                )}

                                                {/* Fulfillment status pill */}
                                                <div className={`px-2 py-0.5 rounded text-[9px] uppercase font-black border flex items-center gap-1 ${getStatusColor(order.status || 'pending')}`}>
                                                    <StatusIcon className="h-2.5 w-2.5" />
                                                    {order.status === 'delivered' ? 'Kézbesítve' : order.status === 'shipped' ? 'Elküldve' : 'Feldolgozás alatt'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gold tracking-tight">{formatPrice(order.total)}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-[#888888] font-bold mt-0.5">
                                                {order.items?.length || 0} db
                                            </p>
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
                                            className="overflow-hidden border-t-2 border-gold/50 bg-[#23190b]"
                                        >
                                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Left Column: Customer & Items */}
                                                <div className="space-y-6">
                                                    {/* Payment Status Card - PROMINENT */}
                                                    <div className="p-6 bg-[#171006] border border-gold/35 rounded-xl space-y-4 shadow-lg">
                                                        <div className="flex justify-between items-center border-b border-gold/20 pb-3">
                                                            <h4 className="text-xs uppercase tracking-[0.3em] text-gold font-black flex items-center gap-2">
                                                                <Banknote className="h-4 w-4" />
                                                                Fizetési állapot
                                                            </h4>
                                                            <span className="text-xs font-bold text-[#fdfdf3]">
                                                                {order.paymentMethod || 'Banki átutalás'}
                                                            </span>
                                                        </div>

                                                        {isBankTransfer ? (
                                                            <div className="space-y-3">
                                                                {isPaid ? (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-500/15 border border-emerald-400/40 rounded-lg">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <Check className="h-4 w-4" /> Kifizetve (Utalás megérkezett)
                                                                            </p>
                                                                            {order.paidAt && (
                                                                                <p className="text-xs text-ivory/80">
                                                                                    Jóváírás ideje: {order.paidAt} {order.paidVia ? `• ${order.paidVia}` : ''}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'pending')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="text-[11px] uppercase font-bold text-ivory/60 hover:text-amber-300 underline transition-colors"
                                                                        >
                                                                            Visszaállítás: mégsem fizetve
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/15 border border-amber-400/40 rounded-lg">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <Clock className="h-4 w-4" /> Utalásra vár ({formatPrice(order.total)})
                                                                            </p>
                                                                            <p className="text-xs text-ivory/80">
                                                                                K&H Bank: 10404089-50526774-52721009 (MARTIN'S BT.)
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'paid')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow transition-all flex items-center gap-2 whitespace-nowrap"
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                            {updatingPaymentId === order.id ? 'Mentés...' : 'Utalás beérkezett'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-3.5 bg-sky-500/15 border border-sky-400/35 rounded-lg text-sm text-sky-200 font-medium">
                                                                Utánvétes fizetés – átvételkor fizetendő.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Customer Data */}
                                                    <div className="p-6 bg-[#171006] border border-gold/30 rounded-xl space-y-4 shadow-lg">
                                                        <h4 className="text-xs uppercase tracking-[0.35em] text-gold font-black border-b border-gold/20 pb-3 flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            Vevő adatai
                                                        </h4>
                                                        <div className="space-y-3 text-base">
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Mail className="h-4 w-4 text-gold shrink-0" />
                                                                    <span className="text-[#fdfdf3] font-medium">{order.customerInfo?.email || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.email)} className="p-1.5 text-gold/60 hover:text-gold transition-all" title="E-mail másolása">
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Phone className="h-4 w-4 text-gold shrink-0" />
                                                                    <span className="text-[#fdfdf3] font-medium">{order.customerInfo?.phone || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.phone)} className="p-1.5 text-gold/60 hover:text-gold transition-all" title="Telefonszám másolása">
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="p-6 bg-[#171006] border border-gold/30 rounded-xl space-y-4 shadow-lg">
                                                        <h4 className="text-xs uppercase tracking-[0.35em] text-gold font-black border-b border-gold/20 pb-3">Megrendelt termékek</h4>
                                                        <div className="space-y-3">
                                                            {(order.items || []).map((item: any, idx: number) => {
                                                                const matchedProd = products.find(p => String(p.id) === String(item.id) || p.name === item.name);
                                                                const itemSku = item.sku || matchedProd?.sku;
                                                                return (
                                                                    <div key={idx} className="flex items-center gap-4 p-4 bg-[#261b0d] border border-gold/25 rounded-lg">
                                                                        {item.image && (
                                                                            <div className="h-20 w-20 bg-black relative shrink-0 rounded-lg overflow-hidden border-2 border-gold/40">
                                                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0 space-y-1">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <h5 className="text-base font-serif font-bold text-[#fdfdf3]">{item.name}</h5>
                                                                                {itemSku && (
                                                                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider bg-gold/20 text-[#f5d593] border border-gold/45 shrink-0">
                                                                                        Cikkszám: {itemSku}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {item.selectedCustomization && (
                                                                                <p className="text-sm text-[#f1d592] font-medium leading-snug">{item.selectedCustomization}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right shrink-0">
                                                                            <p className="text-sm text-[#fdfdf3] font-black">{item.quantity} db</p>
                                                                            <p className="text-sm text-gold font-black">{formatPrice(item.price * item.quantity)}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {order.premiumBox && (
                                                                <div className="flex items-center justify-between p-3.5 bg-gold/15 border border-gold/35 rounded-lg text-sm text-[#f5d593] font-bold">
                                                                    <span>⭐ Prémium Díszdoboz</span>
                                                                    <span>+{formatPrice(order.premiumBoxPrice || 1500)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.comment && (
                                                            <div className="p-4 bg-orange-500/15 border border-orange-400/40 rounded-lg">
                                                                <p className="text-xs uppercase tracking-wider text-orange-300 font-black mb-1">Megjegyzés a vevőtől:</p>
                                                                <p className="text-sm text-[#fdfdf3] italic leading-relaxed">{order.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column: Address, Invoicing & Fulfillment Actions */}
                                                <div className="space-y-6">
                                                    {/* Total and Shipping Info */}
                                                    <div className="bg-[#171006] border border-gold/35 p-6 rounded-xl space-y-6 shadow-lg">
                                                        <div className="flex justify-between items-center border-b border-gold/20 pb-4">
                                                            <h4 className="text-xs uppercase tracking-[0.35em] text-gold font-black flex items-center gap-2">
                                                                {isLocalPickup ? <MapPin className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                                                {isLocalPickup ? 'Helybeni átvétel (Üzletben)' : 'Szállítási adatok'}
                                                            </h4>
                                                            {!isLocalPickup && (
                                                                <button 
                                                                    onClick={() => copyToClipboard(`${order.shippingInfo?.postcode || ''} ${order.shippingInfo?.city || ''}, ${order.shippingInfo?.address || order.shipping?.address || ''}`)}
                                                                    className="text-xs uppercase font-bold text-gold hover:text-[#f5d593] flex items-center gap-1.5 transition-all"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" /> Cím másolása
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2 text-base text-[#fdfdf3]">
                                                            <p className="text-xs font-black uppercase tracking-wider text-[#f1d592] mb-2">
                                                                {isLocalPickup ? 'Átvétel módja: Személyes átvétel az üzletben (1056 Budapest, Molnár u. 23.)' : `Szállítás módja: ${shippingMethodName || 'Házhozszállítás'}`}
                                                            </p>
                                                            <p className="font-bold text-[#fdfdf3] text-lg">{order.customerInfo?.fullName}</p>
                                                            {!isLocalPickup && (
                                                                <div className="space-y-0.5 text-ivory/90">
                                                                    <p>{order.shippingInfo?.postcode || ''} {order.shippingInfo?.city || ''}</p>
                                                                    <p className="font-medium">{order.shippingInfo?.address || order.shipping?.address || '-'}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Billing Info */}
                                                        <div className="pt-5 border-t border-gold/20 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-xs uppercase tracking-[0.35em] text-gold font-black flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4" />
                                                                    Számlázás
                                                                </h4>
                                                            </div>
                                                            <div className="text-base text-ivory/90 space-y-1">
                                                                <p className="font-bold text-[#fdfdf3]">{order.billingInfo?.name || order.customerInfo?.fullName}</p>
                                                                <p>{order.billingInfo?.postcode || ''} {order.billingInfo?.city || ''} {order.billingInfo?.address || ''}</p>
                                                                {order.billingInfo?.taxNumber && (
                                                                    <p className="text-sm text-[#f1d592] font-bold">Adószám: {order.billingInfo.taxNumber}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-5 border-t border-gold/25 flex justify-between items-center">
                                                            <span className="text-sm uppercase tracking-widest text-gold font-black">Végösszeg</span>
                                                            <span className="text-2xl font-black text-[#f5d593] tracking-tight">{formatPrice(order.total)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Fulfillment Status Actions */}
                                                    <div className="p-6 bg-[#171006] border border-gold/30 rounded-xl space-y-4 shadow-lg">
                                                        <h4 className="text-xs uppercase tracking-[0.35em] text-gold font-black">Csomag / Teljesítés állapota</h4>
                                                        <div className="grid grid-cols-3 gap-2.5">
                                                            {[
                                                                { id: 'pending', label: 'Feldolgozás alatt' },
                                                                { id: 'shipped', label: 'Elküldve / Feladva' },
                                                                { id: 'delivered', label: 'Kézbesítve' }
                                                            ].map((s) => (
                                                                <button 
                                                                    key={s.id}
                                                                    onClick={() => handleUpdateFulfillment(order.id, s.id)}
                                                                    className={`px-3 py-3 text-[11px] font-black uppercase tracking-wider border rounded-lg transition-all text-center ${order.status === s.id ? getStatusColor(s.id) : 'border-gold/20 text-ivory/75 hover:border-gold/50 hover:text-[#fdfdf3]'}`}
                                                                >
                                                                    {s.label}
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
