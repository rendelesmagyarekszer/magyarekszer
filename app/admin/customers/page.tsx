"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useConfig } from '@/components/ConfigProvider';
import { 
    Users, 
    Search,
    Mail,
    Phone,
    MapPin,
    Package,
    ChevronRight,
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Building2,
    Copy,
    UserCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CustomersPage() {
    const { allOrders, allUsers } = useAuth();
    const { formatPrice, t } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
    const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

    // Aggregate unique customers from both registerd users and orders (guest checkouts)
    const customers = useMemo(() => {
        const customerMap = new Map<string, any>();

        // 1. Add registered users
        allUsers.forEach((user: any) => {
            customerMap.set(user.email, {
                email: user.email,
                fullName: user.fullName || 'Névtelen Felhasználó',
                phone: user.phone || '',
                orders: [],
                isRegistered: true,
                lastActive: null
            });
        });

        // 2. Aggregate from orders
        allOrders.forEach((order: any) => {
            const email = order.customerInfo?.email || order.userId;
            if (!email) return;

            const existing = customerMap.get(email);
            const orderDate = new Date(order.date);

            if (existing) {
                existing.orders.push(order);
                // Update with most recent info if this order is newer
                if (!existing.lastOrderDate || orderDate > new Date(existing.lastOrderDate)) {
                    existing.fullName = order.customerInfo?.fullName || existing.fullName;
                    existing.phone = order.customerInfo?.phone || existing.phone;
                    existing.lastOrderDate = order.date;
                    existing.lastShipping = order.shippingInfo;
                    existing.lastBilling = order.billingInfo;
                }
            } else {
                customerMap.set(email, {
                    email: email,
                    fullName: order.customerInfo?.fullName || 'Vendég',
                    phone: order.customerInfo?.phone || '',
                    orders: [order],
                    isRegistered: false,
                    lastOrderDate: order.date,
                    lastShipping: order.shippingInfo,
                    lastBilling: order.billingInfo
                });
            }
        });

        return Array.from(customerMap.values()).sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
                const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
                return dateB - dateA; // Most recent first
            } else {
                return a.fullName.localeCompare(b.fullName, 'hu');
            }
        });
    }, [allOrders, allUsers, sortBy]);

    const filteredCustomers = customers.filter(c => 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCustomer = customers.find(c => c.email === selectedCustomerEmail);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/10 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#fdfdf3] tracking-tighter uppercase">Vásárlók</h1>
                    <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black italic">Customer Relationship Management</p>
                </div>
                {!selectedCustomerEmail && (
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Sort Buttons */}
                        <div className="flex bg-[#150e03] border border-gold/10 p-1">
                            <button 
                                onClick={() => setSortBy('date')}
                                className={`px-4 py-3 text-[11px] uppercase tracking-widest font-black transition-all ${sortBy === 'date' ? 'bg-gold text-deep-brown' : 'text-ivory/40 hover:text-gold'}`}
                            >
                                Legutóbbi
                            </button>
                            <button 
                                onClick={() => setSortBy('name')}
                                className={`px-4 py-3 text-[11px] uppercase tracking-widest font-black transition-all ${sortBy === 'name' ? 'bg-gold text-deep-brown' : 'text-ivory/40 hover:text-gold'}`}
                            >
                                ABC
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-72 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Keresés..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#150e03] border border-gold/10 p-4 pl-12 text-sm font-bold uppercase tracking-widest text-ivory outline-none focus:border-gold transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!selectedCustomerEmail ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-3"
                    >
                        {filteredCustomers.length === 0 ? (
                            <div className="p-20 border border-dashed border-gold/10 text-center space-y-4 rounded-3xl">
                                <Users className="h-12 w-12 text-gold/20 mx-auto" />
                                <p className="text-xs uppercase tracking-widest text-ivory/20 font-black">Nem található vásárló</p>
                            </div>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <button
                                    key={customer.email}
                                    onClick={() => setSelectedCustomerEmail(customer.email)}
                                    className="bg-[#150e03] border border-gold/10 p-4 text-left hover:border-gold/40 transition-all group flex items-center justify-between rounded-lg hover:bg-gold/[0.02]"
                                >
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className="h-10 w-10 bg-gold/5 border border-gold/10 rounded flex items-center justify-center shrink-0">
                                            <UserCircle2 className="h-5 w-5 text-gold/60" />
                                        </div>
                                        
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-serif text-ivory/80 tracking-wide group-hover:text-gold transition-colors truncate">
                                                    {customer.fullName}
                                                </h3>
                                                {customer.isRegistered && (
                                                    <span className="text-[7px] font-black uppercase tracking-widest text-gold bg-gold/10 px-1.5 py-0.5 border border-gold/20 rounded">Tag</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-ivory/30 font-bold truncate">{customer.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-12 shrink-0">
                                        <div className="text-right hidden sm:block border-l border-gold/10 pl-8">
                                            <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Rendelések</p>
                                            <p className="text-sm font-black text-gold">{customer.orders.length} db</p>
                                        </div>
                                        <div className="text-right hidden md:block border-l border-gold/10 pl-8 w-32">
                                            <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Utolsó aktivitás</p>
                                            <p className="text-xs font-bold text-ivory/40">
                                                {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('hu-HU') : 'Nincs adat'}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gold/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        {/* Profile Header */}
                        <div className="flex items-start gap-10">
                            <button 
                                onClick={() => setSelectedCustomerEmail(null)}
                                className="mt-2 p-3 bg-gold/5 border border-gold/10 text-gold hover:bg-gold/10 transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif text-ivory tracking-wide">{activeCustomer?.fullName}</h2>
                                    {activeCustomer?.isRegistered && <span className="text-xs font-black uppercase tracking-widest text-gold bg-gold/5 border border-gold/10 px-3 py-1">Regisztrált Tag</span>}
                                </div>
                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-gold/40" />
                                        <span className="text-sm text-ivory/60 font-bold">{activeCustomer?.email}</span>
                                    </div>
                                    {activeCustomer?.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gold/40" />
                                            <span className="text-sm text-ivory/60 font-bold">{activeCustomer?.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left: Contact Info */}
                            <div className="space-y-10">
                                {/* Last Shipping */}
                                <div className="bg-[#150e03] border border-gold/10 p-10 space-y-8">
                                    <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-gold border-b border-gold/10 pb-4 flex items-center gap-3">
                                        <MapPin className="h-4 w-4" />
                                        Postázási Adatok
                                    </h3>
                                    {activeCustomer?.lastShipping ? (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-[#444] uppercase tracking-widest">Utolsó cím</p>
                                                <p className="text-base font-serif text-ivory/80">
                                                    {activeCustomer.lastShipping.postcode} {activeCustomer.lastShipping.city}<br/>
                                                    {activeCustomer.lastShipping.address}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(`${activeCustomer.lastShipping.postcode} ${activeCustomer.lastShipping.city}, ${activeCustomer.lastShipping.address}`)}
                                                className="text-[11px] uppercase font-black text-gold/40 hover:text-gold flex items-center gap-2 transition-all"
                                            >
                                                <Copy className="h-3 w-3" />
                                                Cím másolása
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-ivory/20 font-bold italic">Nincs rögzített adat</p>
                                    )}
                                </div>

                                {/* Last Billing */}
                                <div className="bg-[#150e03] border border-gold/10 p-10 space-y-8">
                                    <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-gold border-b border-gold/10 pb-4 flex items-center gap-3">
                                        <Building2 className="h-4 w-4" />
                                        Számlázási Adatok
                                    </h3>
                                    {activeCustomer?.lastBilling ? (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                {activeCustomer.lastBilling.isCompany && (
                                                    <span className="text-[10px] font-black uppercase text-gold bg-gold/10 px-2 py-0.5 border border-gold/20">Céges</span>
                                                )}
                                                <p className="text-base font-black uppercase tracking-widest text-ivory">{activeCustomer.lastBilling.name}</p>
                                                <p className="text-base font-serif text-ivory/80">
                                                    {activeCustomer.lastBilling.postcode} {activeCustomer.lastBilling.city}<br/>
                                                    {activeCustomer.lastBilling.address}
                                                </p>
                                            </div>
                                            {activeCustomer.lastBilling.taxNumber && (
                                                <div className="pt-4 flex items-center gap-4 border-t border-gold/5">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#444]">Adószám:</span>
                                                    <span className="text-sm font-serif text-gold font-bold">{activeCustomer.lastBilling.taxNumber}</span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    const b = activeCustomer.lastBilling;
                                                    copyToClipboard(`${b.name}\n${b.postcode} ${b.city}, ${b.address}${b.taxNumber ? `\nAdószám: ${b.taxNumber}` : ''}`);
                                                }}
                                                className="text-[11px] uppercase font-black text-gold/40 hover:text-gold flex items-center gap-2 transition-all"
                                            >
                                                <Copy className="h-3 w-3" />
                                                Számlázási adatok másolása
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-ivory/20 font-bold italic">Nincs rögzített adat</p>
                                    )}
                                </div>
                            </div>

                            {/* Center/Right: Purchase History */}
                            <div className="lg:col-span-2 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-black uppercase tracking-[0.5em] text-gold">Vásárlási Előzmények ({activeCustomer?.orders.length})</h3>
                                    <div className="h-[1px] flex-1 bg-gold/10 ml-8"></div>
                                </div>

                                <div className="space-y-6">
                                    {activeCustomer?.orders.map((order: any) => (
                                        <div key={order.id} className="bg-white/[0.02] border border-gold/5 hover:border-gold/20 transition-all p-8 flex flex-col md:flex-row gap-8 items-center">
                                            <div className="flex flex-col items-center justify-center p-4 bg-gold/5 border border-gold/10 w-24 shrink-0">
                                                <Calendar className="h-4 w-4 text-gold/40 mb-2" />
                                                <span className="text-sm font-serif text-ivory">{new Date(order.date).toLocaleDateString('hu-HU')}</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-black text-ivory uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${
                                                        order.status === 'delivered' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 
                                                        order.status === 'shipped' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 
                                                        'border-gold/30 text-gold bg-gold/5'
                                                    }`}>{order.status}</span>
                                                </div>
                                                <p className="text-sm text-ivory/60 font-serif italic">
                                                    {order.items.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-black text-gold tracking-tight">{formatPrice(order.total)}</p>
                                                <Link 
                                                    href={`/admin/orders`}
                                                    className="inline-flex items-center gap-2 text-[11px] uppercase font-black text-ivory/40 hover:text-gold transition-all mt-2"
                                                >
                                                    Részletek <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ExternalLink(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
    )
}
