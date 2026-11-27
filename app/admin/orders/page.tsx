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
    Banknote,
    Trash2
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

    // Delete Order (e.g. test orders)
    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Biztosan véglegesen törlöd ezt a rendelést?')) return;
        try {
            const res = await fetch('/api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, action: 'delete' })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.orders)) {
                    setServerOrders(data.orders);
                    setExpandedOrder(null);
                } else {
                    fetchServerOrders();
                }
            }
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
                        
                        const isUnopened = !isViewed;

                        return (
                            <div 
                                key={order.id} 
                                className={`rounded-xl border transition-all overflow-hidden ${
                                    isExpanded
                                        ? 'bg-[#fdfdf3] border-gold ring-2 ring-gold shadow-[0_0_40px_rgba(201,165,106,0.3)]'
                                        : isUnopened
                                            ? 'bg-[#e6faee] border-emerald-400 border-l-8 border-l-emerald-600 shadow-lg hover:bg-[#d7f7e4]'
                                            : 'bg-[#150e03] border-gold/20 hover:border-gold/50'
                                }`}
                            >
                                {/* Order Header */}
                                <div 
                                    className={`p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer group transition-colors ${
                                        isExpanded
                                            ? 'bg-[#f4efe1] border-b-2 border-gold/40'
                                            : isUnopened
                                                ? 'hover:bg-[#d7f7e4]'
                                                : 'hover:bg-gold/10'
                                    }`}
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                                        <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg border w-24 shrink-0 ${
                                            isExpanded
                                                ? 'bg-white border-[#c9a56a]/50'
                                                : isUnopened
                                                    ? 'bg-white/90 border-emerald-400'
                                                    : 'bg-gold/10 border-gold/20'
                                        }`}>
                                            <span className={`text-[8px] uppercase font-black mb-0.5 ${
                                                isExpanded ? 'text-[#8e6d3a]' : isUnopened ? 'text-emerald-700' : 'text-gold/70'
                                            }`}>Dátum</span>
                                            <span className={`text-xs font-bold ${
                                                isExpanded || isUnopened ? 'text-[#150e03]' : 'text-[#fdfdf3]'
                                            }`}>
                                                {order.date ? new Date(order.date).toLocaleDateString('hu-HU') : '-'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                                                <h3 className={`text-lg font-serif font-bold tracking-wide transition-colors truncate max-w-[220px] sm:max-w-[300px] ${
                                                    isExpanded
                                                        ? 'text-[#150e03]'
                                                        : isUnopened
                                                            ? 'text-[#052e16]'
                                                            : 'text-[#fdfdf3] group-hover:text-gold'
                                                }`}>
                                                    {order.customerInfo?.fullName || 'Vendég'}
                                                </h3>
                                                {isUnopened ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-emerald-600 text-white shadow-sm shrink-0">
                                                        ● Új rendelés
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider flex items-center gap-1 shrink-0 ${
                                                        isExpanded
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : 'bg-white/10 text-ivory/60 border border-white/15'
                                                    }`}>
                                                        <Check className="h-2.5 w-2.5" /> Megnyitva
                                                    </span>
                                                )}
                                                <p className={`hidden xl:block text-[10px] uppercase tracking-widest font-bold ${
                                                    isExpanded || isUnopened ? 'text-[#5c4b32]' : 'text-ivory/50'
                                                }`}>
                                                    ID: <span className={isExpanded || isUnopened ? 'text-[#150e03]' : 'text-ivory/80'}>{order.id}</span>
                                                </p>
                                            </div>
                                            
                                            {/* Always visible Shipping + Payment + Status pills */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Shipping vs Local Pickup Pill */}
                                                {isLocalPickup ? (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                        isExpanded || isUnopened
                                                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                                                            : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                                    }`}>
                                                        <MapPin className="h-2.5 w-2.5" /> Helybeni átvétel (Üzletben)
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                        isExpanded || isUnopened
                                                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                                                            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                                    }`}>
                                                        <Truck className="h-2.5 w-2.5" /> Szállítás{shippingMethodName ? `: ${shippingMethodName}` : ''}
                                                    </span>
                                                )}

                                                {/* Payment Method & Status Pill */}
                                                {isBankTransfer ? (
                                                    isPaid ? (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                            isExpanded || isUnopened
                                                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                        }`}>
                                                            <Check className="h-2.5 w-2.5" /> Előre utalás • Fizetve
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                            isExpanded || isUnopened
                                                                ? 'bg-amber-100 text-amber-900 border-amber-400'
                                                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                        }`}>
                                                            <Clock className="h-2.5 w-2.5" /> Előre utalás • Utalásra vár
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                        isExpanded || isUnopened
                                                            ? 'bg-teal-100 text-teal-900 border-teal-300'
                                                            : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                                                    }`}>
                                                        <CreditCard className="h-2.5 w-2.5" /> Utánvét
                                                    </span>
                                                )}

                                                {/* Fulfillment status pill */}
                                                <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border flex items-center gap-1 ${
                                                    isExpanded || isUnopened
                                                        ? 'bg-white text-[#5c4318] border-[#c9a56a]/60'
                                                        : getStatusColor(order.status || 'pending')
                                                }`}>
                                                    <StatusIcon className="h-2.5 w-2.5" />
                                                    {order.status === 'delivered' ? 'Kézbesítve' : order.status === 'shipped' ? 'Elküldve' : 'Feldolgozás alatt'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className={`text-base font-black tracking-tight ${
                                                isExpanded || isUnopened ? 'text-[#052e16]' : 'text-gold'
                                            }`}>{formatPrice(order.total)}</p>
                                            <p className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${
                                                isExpanded || isUnopened ? 'text-[#4a5568]' : 'text-[#888888]'
                                            }`}>
                                                {order.items?.length || 0} db
                                            </p>
                                        </div>
                                        <div className={`p-2 rounded-full transition-all ${
                                            isExpanded
                                                ? 'bg-[#c9a56a] text-[#150e03] rotate-180'
                                                : isUnopened
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'text-gold/50 group-hover:text-gold'
                                        }`}>
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details - HIGH-CONTRAST LIGHT CREAM / WHITE VIEW */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[#fdfdf3] text-[#150e03]"
                                        >
                                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Left Column: Customer & Items */}
                                                <div className="space-y-6">
                                                    {/* Payment Status Card - PROMINENT */}
                                                    <div className="p-6 bg-white border border-[#c9a56a]/40 rounded-xl space-y-4 shadow-sm">
                                                        <div className="flex justify-between items-center border-b border-[#c9a56a]/25 pb-3">
                                                            <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black flex items-center gap-2">
                                                                <Banknote className="h-4 w-4" />
                                                                Fizetési állapot
                                                            </h4>
                                                            <span className="text-xs font-bold text-[#150e03]">
                                                                {order.paymentMethod || 'Banki átutalás'}
                                                            </span>
                                                        </div>

                                                        {isBankTransfer ? (
                                                            <div className="space-y-3">
                                                                {isPaid ? (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-400 rounded-lg">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <Check className="h-4 w-4" /> Kifizetve (Utalás megérkezett)
                                                                            </p>
                                                                            {order.paidAt && (
                                                                                <p className="text-xs text-emerald-800">
                                                                                    Jóváírás ideje: {order.paidAt} {order.paidVia ? `• ${order.paidVia}` : ''}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'pending')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="text-[11px] uppercase font-bold text-emerald-800/70 hover:text-amber-700 underline transition-colors"
                                                                        >
                                                                            Visszaállítás: mégsem fizetve
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-400 rounded-lg">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <Clock className="h-4 w-4" /> Utalásra vár ({formatPrice(order.total)})
                                                                            </p>
                                                                            <p className="text-xs text-amber-900/80">
                                                                                K&H Bank: 10404089-50526774-52721009 (MARTIN'S BT.)
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'paid')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow transition-all flex items-center gap-2 whitespace-nowrap"
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                            {updatingPaymentId === order.id ? 'Mentés...' : 'Utalás beérkezett'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-3.5 bg-sky-50 border border-sky-300 rounded-lg text-sm text-sky-900 font-semibold">
                                                                Utánvétes fizetés – átvételkor fizetendő.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Customer Data */}
                                                    <div className="p-6 bg-white border border-[#c9a56a]/40 rounded-xl space-y-4 shadow-sm">
                                                        <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black border-b border-[#c9a56a]/25 pb-3 flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            Vevő adatai
                                                        </h4>
                                                        <div className="space-y-3 text-base">
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Mail className="h-4 w-4 text-[#8e6d3a] shrink-0" />
                                                                    <span className="text-[#150e03] font-semibold">{order.customerInfo?.email || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.email)} className="p-1.5 text-[#8e6d3a] hover:text-[#150e03] transition-all" title="E-mail másolása">
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Phone className="h-4 w-4 text-[#8e6d3a] shrink-0" />
                                                                    <span className="text-[#150e03] font-semibold">{order.customerInfo?.phone || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.phone)} className="p-1.5 text-[#8e6d3a] hover:text-[#150e03] transition-all" title="Telefonszám másolása">
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="p-6 bg-white border border-[#c9a56a]/40 rounded-xl space-y-4 shadow-sm">
                                                        <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black border-b border-[#c9a56a]/25 pb-3">Megrendelt termékek</h4>
                                                        <div className="space-y-3">
                                                            {(order.items || []).map((item: any, idx: number) => {
                                                                const matchedProd = products.find(p => String(p.id) === String(item.id) || p.name === item.name);
                                                                const itemSku = item.sku || matchedProd?.sku;
                                                                return (
                                                                    <div key={idx} className="flex items-center gap-4 p-4 bg-[#faf7ee] border border-[#c9a56a]/35 rounded-lg">
                                                                        {item.image && (
                                                                            <div className="h-20 w-20 bg-black relative shrink-0 rounded-lg overflow-hidden border-2 border-[#c9a56a]/60">
                                                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0 space-y-1">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <h5 className="text-base font-serif font-bold text-[#150e03]">{item.name}</h5>
                                                                                {itemSku && (
                                                                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider bg-[#150e03] text-[#f5d593] shrink-0">
                                                                                        Cikkszám: {itemSku}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {item.selectedCustomization && (
                                                                                <p className="text-sm text-[#6b4f1d] font-semibold leading-snug">{item.selectedCustomization}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right shrink-0">
                                                                            <p className="text-sm text-[#150e03] font-black">{item.quantity} db</p>
                                                                            <p className="text-base text-[#8e6d3a] font-black">{formatPrice(item.price * item.quantity)}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {order.premiumBox && (
                                                                <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-900 font-bold">
                                                                    <span>⭐ Prémium Díszdoboz</span>
                                                                    <span>+{formatPrice(order.premiumBoxPrice || 1500)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.comment && (
                                                            <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg">
                                                                <p className="text-xs uppercase tracking-wider text-orange-800 font-black mb-1">Megjegyzés a vevőtől:</p>
                                                                <p className="text-sm text-[#150e03] italic leading-relaxed">{order.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column: Address, Invoicing & Fulfillment Actions */}
                                                <div className="space-y-6">
                                                    {/* Total and Shipping Info */}
                                                    <div className="bg-white border border-[#c9a56a]/40 p-6 rounded-xl space-y-6 shadow-sm">
                                                        <div className="flex justify-between items-center border-b border-[#c9a56a]/25 pb-4">
                                                            <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black flex items-center gap-2">
                                                                {isLocalPickup ? <MapPin className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                                                {isLocalPickup ? 'Helybeni átvétel (Üzletben)' : 'Szállítási adatok'}
                                                            </h4>
                                                            {!isLocalPickup && (
                                                                <button 
                                                                    onClick={() => copyToClipboard(`${order.shippingInfo?.postcode || ''} ${order.shippingInfo?.city || ''}, ${order.shippingInfo?.address || order.shipping?.address || ''}`)}
                                                                    className="text-xs uppercase font-bold text-[#8e6d3a] hover:text-[#150e03] flex items-center gap-1.5 transition-all"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" /> Cím másolása
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2 text-base text-[#150e03]">
                                                            <p className="text-xs font-black uppercase tracking-wider text-[#8e6d3a] mb-2">
                                                                {isLocalPickup ? 'Átvétel módja: Személyes átvétel az üzletben (1056 Budapest, Molnár u. 23.)' : `Szállítás módja: ${shippingMethodName || 'Házhozszállítás'}`}
                                                            </p>
                                                            <p className="font-bold text-[#150e03] text-lg">{order.customerInfo?.fullName}</p>
                                                            {!isLocalPickup && (
                                                                <div className="space-y-0.5 text-[#2d2417]">
                                                                    <p>{order.shippingInfo?.postcode || ''} {order.shippingInfo?.city || ''}</p>
                                                                    <p className="font-semibold">{order.shippingInfo?.address || order.shipping?.address || '-'}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Billing Info */}
                                                        <div className="pt-5 border-t border-[#c9a56a]/25 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4" />
                                                                    Számlázás
                                                                </h4>
                                                            </div>
                                                            <div className="text-base text-[#2d2417] space-y-1">
                                                                <p className="font-bold text-[#150e03]">{order.billingInfo?.name || order.customerInfo?.fullName}</p>
                                                                <p>{order.billingInfo?.postcode || ''} {order.billingInfo?.city || ''} {order.billingInfo?.address || ''}</p>
                                                                {order.billingInfo?.taxNumber && (
                                                                    <p className="text-sm text-[#8e6d3a] font-bold">Adószám: {order.billingInfo.taxNumber}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-5 border-t border-[#c9a56a]/40 flex justify-between items-center">
                                                            <span className="text-sm uppercase tracking-widest text-[#8e6d3a] font-black">Végösszeg</span>
                                                            <span className="text-2xl font-black text-[#150e03] tracking-tight">{formatPrice(order.total)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Fulfillment Status Actions */}
                                                    <div className="p-6 bg-white border border-[#c9a56a]/40 rounded-xl space-y-4 shadow-sm">
                                                        <h4 className="text-xs uppercase tracking-[0.25em] text-[#8e6d3a] font-black">Csomag / Teljesítés állapota</h4>
                                                        <div className="grid grid-cols-3 gap-2.5">
                                                            {[
                                                                { id: 'pending', label: 'Feldolgozás alatt' },
                                                                { id: 'shipped', label: 'Elküldve / Feladva' },
                                                                { id: 'delivered', label: 'Kézbesítve' }
                                                            ].map((s) => (
                                                                <button 
                                                                    key={s.id}
                                                                    onClick={() => handleUpdateFulfillment(order.id, s.id)}
                                                                    className={`px-3 py-3 text-[11px] font-black uppercase tracking-wider border rounded-lg transition-all text-center ${
                                                                        order.status === s.id
                                                                            ? 'bg-[#150e03] text-[#f5d593] border-[#150e03] shadow'
                                                                            : 'bg-[#faf7ee] border-[#c9a56a]/40 text-[#5c4318] hover:border-[#150e03] hover:text-[#150e03]'
                                                                    }`}
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="pt-4 border-t border-[#c9a56a]/25 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteOrder(order.id)}
                                                                className="px-4 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Rendelés törlése
                                                            </button>
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
