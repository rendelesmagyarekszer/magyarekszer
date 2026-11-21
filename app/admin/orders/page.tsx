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
    const { formatPrice, t, addNotification } = useConfig();
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [serverOrders, setServerOrders] = useState<any[]>([]);
    const [isCheckingBank, setIsCheckingBank] = useState(false);
    const [bankCheckMessage, setBankCheckMessage] = useState<string | null>(null);
    const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

    // Fetch server orders
    const fetchServerOrders = async () => {
        try {
            const res = await fetch('/api/orders.php');
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
                                className={`bg-[#150e03] border transition-all ${isExpanded ? 'border-gold shadow-2xl scale-[1.01]' : 'border-gold/10 hover:border-gold/30'}`}
                            >
                                {/* Order Header - SLEEK & COMPACT LIST ROW */}
                                <div 
                                    className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer group hover:bg-gold/5 transition-colors"
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                                        <div className="flex flex-col items-center justify-center py-2 px-3 bg-gold/5 border border-gold/10 w-20 shrink-0">
                                            <span className="text-[6px] uppercase font-black text-gold/40 mb-0.5">Dátum</span>
                                            <span className="text-[11px] font-bold text-ivory/80">
                                                {order.date ? new Date(order.date).toLocaleDateString('hu-HU') : '-'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1.5 min-w-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <h3 className="text-base font-serif text-ivory/90 tracking-wider group-hover:text-gold transition-colors truncate max-w-[200px] sm:max-w-[260px]">
                                                    {order.customerInfo?.fullName || 'Vendég'}
                                                </h3>
                                                <p className="hidden xl:block text-[10px] uppercase tracking-widest text-[#666666] font-bold">
                                                    ID: <span className="text-ivory/50">{order.id}</span>
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
                                            className="overflow-hidden border-t border-gold/10 bg-black/40"
                                        >
                                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                {/* Left Column: Customer & Items */}
                                                <div className="space-y-8">
                                                    {/* Payment Status Card - PROMINENT */}
                                                    <div className="p-6 bg-[#1a1104] border border-gold/30 rounded space-y-4">
                                                        <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                                                            <h4 className="text-xs uppercase tracking-[0.3em] text-gold font-black flex items-center gap-2">
                                                                <Banknote className="h-4 w-4" />
                                                                Fizetési állapot
                                                            </h4>
                                                            <span className="text-[11px] font-bold text-ivory/60">
                                                                {order.paymentMethod || 'Banki átutalás'}
                                                            </span>
                                                        </div>

                                                        {isBankTransfer ? (
                                                            <div className="space-y-3">
                                                                {isPaid ? (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                                <Check className="h-4 w-4" /> Kifizetve (Utalás megérkezett)
                                                                            </p>
                                                                            {order.paidAt && (
                                                                                <p className="text-[10px] text-ivory/60">
                                                                                    Jóváírás ideje: {order.paidAt} {order.paidVia ? `• ${order.paidVia}` : ''}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'pending')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="text-[10px] uppercase font-bold text-ivory/40 hover:text-amber-400 underline transition-colors"
                                                                        >
                                                                            Visszaállítás: mégsem fizetve
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded">
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                                <Clock className="h-4 w-4" /> Utalásra vár ({formatPrice(order.total)})
                                                                            </p>
                                                                            <p className="text-[10px] text-ivory/60">
                                                                                K&H Bank: 10404089-50526774-52721009 (MARTIN'S BT.)
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUpdatePayment(order.id, 'paid')}
                                                                            disabled={updatingPaymentId === order.id}
                                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-black uppercase tracking-widest shadow transition-all flex items-center gap-2 whitespace-nowrap"
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                            {updatingPaymentId === order.id ? 'Mentés...' : 'Utalás beérkezett'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                                                                Utánvétes fizetés – átvételkor az üzletben fizetendő.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Customer Data */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black border-b border-gold/10 pb-3 flex items-center gap-2">
                                                            <User className="h-3.5 w-3.5" />
                                                            Vevő adatai
                                                        </h4>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Mail className="h-4 w-4 text-gold/60" />
                                                                    <span className="text-ivory/80">{order.customerInfo?.email || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.email)} className="opacity-0 group-hover:opacity-100 p-1 text-gold/40 hover:text-gold transition-all">
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <Phone className="h-4 w-4 text-gold/60" />
                                                                    <span className="text-ivory/80">{order.customerInfo?.phone || '-'}</span>
                                                                </div>
                                                                <button onClick={() => copyToClipboard(order.customerInfo?.phone)} className="opacity-0 group-hover:opacity-100 p-1 text-gold/40 hover:text-gold transition-all">
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black border-b border-gold/10 pb-3">Megrendelt termékek</h4>
                                                        <div className="space-y-3">
                                                            {(order.items || []).map((item: any, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded">
                                                                    {item.image && (
                                                                        <div className="h-12 w-12 bg-black relative shrink-0 rounded overflow-hidden">
                                                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="text-sm font-serif text-ivory truncate">{item.name}</h5>
                                                                        {item.selectedCustomization && (
                                                                            <p className="text-xs text-gold/80 italic mt-0.5">{item.selectedCustomization}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-ivory font-bold">{item.quantity} db</p>
                                                                        <p className="text-xs text-gold font-bold">{formatPrice(item.price * item.quantity)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {order.premiumBox && (
                                                                <div className="flex items-center justify-between p-3 bg-gold/5 border border-gold/20 rounded text-xs text-gold">
                                                                    <span>⭐ Prémium Díszdoboz</span>
                                                                    <span className="font-bold">+{formatPrice(order.premiumBoxPrice || 1500)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.comment && (
                                                            <div className="p-3 bg-orange-900/10 border border-orange-500/20 rounded">
                                                                <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-1">Megjegyzés a vevőtől:</p>
                                                                <p className="text-xs text-ivory/80 italic">{order.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column: Address, Invoicing & Fulfillment Actions */}
                                                <div className="space-y-8">
                                                    {/* Total and Shipping Info */}
                                                    <div className="bg-gold/5 border border-gold/20 p-6 rounded space-y-6">
                                                        <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                                                            <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black flex items-center gap-2">
                                                                {isLocalPickup ? <MapPin className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                                                                {isLocalPickup ? 'Helybeni átvétel (Üzletben)' : 'Szállítási adatok'}
                                                            </h4>
                                                            {!isLocalPickup && (
                                                                <button 
                                                                    onClick={() => copyToClipboard(`${order.shippingInfo?.postcode || ''} ${order.shippingInfo?.city || ''}, ${order.shippingInfo?.address || order.shipping?.address || ''}`)}
                                                                    className="text-[10px] uppercase font-bold text-gold/60 hover:text-gold flex items-center gap-1 transition-all"
                                                                >
                                                                    <Copy className="h-3 w-3" /> Cím másolása
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 text-sm text-ivory/80">
                                                            <p className="text-xs font-black uppercase tracking-wider text-gold mb-2">
                                                                {isLocalPickup ? 'Átvétel módja: Személyes átvétel az üzletben (1056 Budapest, Molnár u. 23.)' : `Szállítás módja: ${shippingMethodName || 'Házhozszállítás'}`}
                                                            </p>
                                                            <p className="font-bold text-ivory">{order.customerInfo?.fullName}</p>
                                                            {!isLocalPickup && (
                                                                <>
                                                                    <p>{order.shippingInfo?.postcode || ''} {order.shippingInfo?.city || ''}</p>
                                                                    <p>{order.shippingInfo?.address || order.shipping?.address || '-'}</p>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Billing Info */}
                                                        <div className="pt-4 border-t border-gold/10 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-xs uppercase tracking-[0.4em] text-gold font-black flex items-center gap-2">
                                                                    <Building2 className="h-3.5 w-3.5" />
                                                                    Számlázás
                                                                </h4>
                                                            </div>
                                                            <div className="text-sm text-ivory/80 space-y-1">
                                                                <p className="font-bold text-ivory">{order.billingInfo?.name || order.customerInfo?.fullName}</p>
                                                                <p>{order.billingInfo?.postcode || ''} {order.billingInfo?.city || ''} {order.billingInfo?.address || ''}</p>
                                                                {order.billingInfo?.taxNumber && (
                                                                    <p className="text-xs text-gold">Adószám: {order.billingInfo.taxNumber}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-gold/10 flex justify-between items-center">
                                                            <span className="text-xs uppercase tracking-widest text-gold font-bold">Végösszeg</span>
                                                            <span className="text-2xl font-black text-gold tracking-tight">{formatPrice(order.total)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Fulfillment Status Actions */}
                                                    <div className="space-y-3 pt-2">
                                                        <h4 className="text-[11px] uppercase tracking-[0.4em] text-[#666666] font-black">Csomag / Teljesítés állapota</h4>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[
                                                                { id: 'pending', label: 'Feldolgozás alatt' },
                                                                { id: 'shipped', label: 'Elküldve / Feladva' },
                                                                { id: 'delivered', label: 'Kézbesítve' }
                                                            ].map((s) => (
                                                                <button 
                                                                    key={s.id}
                                                                    onClick={() => handleUpdateFulfillment(order.id, s.id)}
                                                                    className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider border rounded transition-all text-center ${order.status === s.id ? getStatusColor(s.id) : 'border-white/5 text-[#555] hover:border-white/10 hover:text-white/60'}`}
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
