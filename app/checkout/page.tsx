"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { Truck, MapPin, Wallet, CheckCircle2, ArrowLeft, Ticket, X, Star, Eye, Building2 } from 'lucide-react';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import MplPointSelector from '@/components/MplPointSelector';
import FoxpostSelector from '@/components/FoxpostSelector';

interface MplPoint {
    id: string;
    name: string;
    city: string;
    address: string;
    postcode: string;
    type: 'automata' | 'postapont';
}

export default function CheckoutPage() {
    const { cartItems, totalAmount, baseTotal, discountAmount, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCart();
    const { premiumBoxPrice, formatPrice, t, language, vacationMode, addNotification, imageSettings, shippingSettings } = useConfig();
    const { addOrder } = useAuth();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isPremiumBoxSelected, setIsPremiumBoxSelected] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, src: string, title: string }>({
        isOpen: false,
        src: '',
        title: ''
    });

    const baseShippingOptions = [];

    if (shippingSettings?.mplHomeEnabled !== false) {
        baseShippingOptions.push({ id: 'mpl-delivery', name: t('shipping_mpl_home'), price: shippingSettings?.mplHomePrice ?? 3000, icon: Truck, description: t('shipping_mpl_home_desc') });
    }

    if (shippingSettings?.mplBoxEnabled !== false) {
        baseShippingOptions.push({ id: 'mpl-box', name: t('shipping_mpl_box'), price: shippingSettings?.mplBoxPrice ?? 3000, icon: Truck, description: t('shipping_mpl_box_desc') });
    }

    if (shippingSettings?.foxpostEnabled !== false) {
        baseShippingOptions.push({ id: 'foxpost-box', name: t('shipping_foxpost_box'), price: shippingSettings?.foxpostPrice ?? 1500, icon: Truck, description: t('shipping_foxpost_box_desc') });
    }

    if (shippingSettings?.localPickupEnabled !== false) {
        baseShippingOptions.push({ id: 'local-pickup', name: t('shipping_local'), price: shippingSettings?.localPickupPrice ?? 0, icon: MapPin, description: t('shipping_local_desc') });
    }

    const shippingOptions = baseShippingOptions;

    const paymentOptions = [
        { id: 'transfer', name: t('payment_transfer'), icon: Building2, description: t('payment_transfer_desc') },
        { id: 'cod', name: t('payment_cod'), icon: Wallet, description: t('payment_cod_desc') },
        { id: 'inperson', name: t('payment_inperson') || 'Személyes fizetés (üzletben)', icon: MapPin, description: t('payment_inperson_desc') || 'Az üzletünkben személyesen fizet átvételkor.' },
    ];

    const [shipping, setShipping] = useState(shippingOptions[0]);
    const [payment, setPayment] = useState(paymentOptions[0]);
    const [isOrdered, setIsOrdered] = useState(false);
    const [isMplSelectorOpen, setIsMplSelectorOpen] = useState(false);
    const [isFoxpostSelectorOpen, setIsFoxpostSelectorOpen] = useState(false);
    const [selectedMplPoint, setSelectedMplPoint] = useState<MplPoint | null>(null);
    const [formErrors, setFormErrors] = useState<string | null>(null);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const error = applyCoupon(couponCode);
        setCouponError(error);
        if (!error) setCouponCode('');
    };

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        shippingPostcode: '',
        shippingCity: '',
        shippingAddress: '',
        billingName: '',
        billingPostcode: '',
        billingCity: '',
        billingAddress: '',
        taxNumber: '',
        isCompany: false,
        billingSameAsShipping: true,
        comment: '',
        foxpostMachine: ''
    });

    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    const handleOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (shipping.id === 'mpl-box' && !selectedMplPoint) {
            setFormErrors(t('checkout_error_mpl'));
            const el = document.getElementById('shipping-method-section');
            el?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (shipping.id === 'foxpost-box' && !formData.foxpostMachine) {
            setFormErrors('Kérjük adja meg a Foxpost automata nevét vagy címét!');
            const el = document.getElementById('shipping-method-section');
            el?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (!termsAccepted) {
            setFormErrors(t('checkout_error_terms'));
            return;
        }

        // Removed raw credit card validation to ensure PCI compliance

        setFormErrors(null);
        
        const billingInfo = {
            isCompany: formData.isCompany,
            name: formData.billingSameAsShipping ? formData.fullName : formData.billingName,
            postcode: formData.billingSameAsShipping ? formData.shippingPostcode : formData.billingPostcode,
            city: formData.billingSameAsShipping ? formData.shippingCity : formData.billingCity,
            address: formData.billingSameAsShipping ? formData.shippingAddress : formData.billingAddress,
            taxNumber: formData.isCompany ? formData.taxNumber : undefined
        };

        const shippingInfo = {
            postcode: formData.shippingPostcode,
            city: formData.shippingCity,
            address: shipping.id === 'mpl-box' && selectedMplPoint 
                ? `${selectedMplPoint.name} (${selectedMplPoint.id}) - ${selectedMplPoint.postcode} ${selectedMplPoint.city}, ${selectedMplPoint.address}`
                : shipping.id === 'foxpost-box' ? formData.foxpostMachine : formData.shippingAddress,
            method: shipping.name
        };

        // Prepare detailed order data
        const orderData = {
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                selectedCustomization: item.selectedCustomization
            })),
            total: finalTotal,
            comment: formData.comment,
            customerInfo: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone
            },
            shipping: shippingInfo,
            billing: billingInfo,
            paymentMethod: payment.name,
            premiumBox: isPremiumBoxSelected,
            premiumBoxPrice: premiumBoxPrice,
            marketingConsent: marketingConsent
        };

        addOrder({
            ...orderData,
            shippingInfo,
            billingInfo,
        });

        // Trigger simulated email notification
        addNotification({
            subject: `Új rendelés érkezett: ${formData.fullName}`,
            customerName: formData.fullName,
            customerEmail: formData.email,
            shipping: shippingInfo,
            billing: billingInfo,
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                customization: item.selectedCustomization
            })),
            total: finalTotal,
            premiumBox: isPremiumBoxSelected,
            marketingConsent: marketingConsent
        });

        // Send real emails (fire-and-forget, don't block UI)
        fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        }).catch(err => console.error('Email send failed:', err));

        setIsOrdered(true);
        clearCart();
    };



    if (isOrdered) {
        return (
            <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-[#150e03]">
                <div className="bg-[#c9a56a]/10 p-10 rounded-full mb-12 border border-[#c9a56a]/20">
                    <CheckCircle2 className="h-20 w-20 text-[#c9a56a]" />
                </div>
                <h1 className="text-3xl font-serif text-[#fdfdf3] mb-6 uppercase tracking-[0.4em] text-center">{t('success_title')}</h1>
                <p className="text-[#999999] text-center max-w-md mb-8 italic font-serif leading-loose text-sm">
                    {t('success_desc')}
                </p>
                
                <div className={`p-6 rounded-xl text-center text-sm sm:text-xs uppercase tracking-widest font-black mb-6 shadow-inner border max-w-lg animate-in fade-in zoom-in duration-500 delay-150 ${vacationMode?.isActive ? 'bg-red-900/10 border-red-500/20 text-red-500/90' : 'bg-[#c9a56a]/5 border-[#c9a56a]/20 text-[#c9a56a]'}`}>
                    {vacationMode?.isActive ? (
                        <>{t('success_vacation_title')} <br/><span className="mt-2 block text-red-400 font-bold text-xs sm:text-sm">{t('success_vacation_desc').replace('{date}', vacationMode.returnDate || '')}</span></>
                    ) : (
                        <>{t('success_info_title')} <br/><span className="mt-2 block text-[#fdfdf3] font-bold text-xs sm:text-sm">{t('success_info_desc')} <span className="text-[#c9a56a] block mt-1 uppercase">{t('success_info_casting')}</span></span></>
                    )}
                </div>

                {payment.id === 'transfer' && (
                    <div className="mb-12 p-8 bg-gold/[0.03] border border-gold/10 rounded-2xl max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-gold text-center mb-6">{t('transfer_details_title')}</p>
                        <div className="space-y-4 font-serif">
                            <div className="flex justify-between items-center border-b border-gold/5 pb-2">
                                <span className="text-sm text-[#666] uppercase tracking-widest">{t('transfer_name')}</span>
                                <span className="text-xs text-[#fdfdf3] font-bold">MARTIN'S BT.</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gold/5 pb-2">
                                <span className="text-sm text-[#666] uppercase tracking-widest">{t('transfer_bank')}</span>
                                <span className="text-xs text-[#fdfdf3] font-bold">{t('bank_name')}</span>
                            </div>
                            <div className="flex flex-col gap-2 border-b border-gold/5 pb-2">
                                <span className="text-sm text-[#666] uppercase tracking-widest">{t('transfer_account')}</span>
                                <span className="text-xl md:text-2xl text-gold font-black tracking-widest py-2">{t('bank_account')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] text-[#666] uppercase tracking-widest">IBAN:</span>
                                    <span className="text-sm text-[#fdfdf3] font-bold">{t('bank_iban')}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-[8px] text-[#666] uppercase tracking-widest">SWIFT:</span>
                                    <span className="text-sm text-[#fdfdf3] font-bold">{t('bank_swift')}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-[#999999] italic text-center mt-6 leading-relaxed">
                            {t('transfer_email_info')}
                        </p>
                    </div>
                )}





                <Link href="/" className="bg-[#c9a56a] text-[#150e03] px-12 py-5 font-black uppercase tracking-[0.4em] text-sm hover:bg-[#b08d55] transition-all">
                    {t('back_to_home')}
                </Link>
            </div>
        );
    }

    const finalTotal = totalAmount + shipping.price + (isPremiumBoxSelected ? premiumBoxPrice : 0);

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-10 sm:py-20 px-4">
            <div className="max-w-[1200px] mx-auto">
                <Link href="/cart" className="flex items-center text-sm text-[#666666] hover:text-[#c9a56a] mb-12 transition-colors uppercase tracking-[0.3em] font-bold">
                    <ArrowLeft className="h-3 w-3 mr-2" />
                    {t('back_to_cart')}
                </Link>

                <h1 className="text-2xl sm:text-3xl font-serif text-[#fdfdf3] mb-10 sm:mb-20 border-b border-[#c9a56a]/10 pb-8 sm:pb-12 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center">
                    {t('checkout_title')}
                </h1>

                <form onSubmit={handleOrder} className="flex flex-col lg:flex-row gap-20">
                    {/* Steps Section */}
                    <div className="flex-1 space-y-12 sm:space-y-24">
                        {/* 1. Contact Info */}
                        <section>
                            <h2 className="text-lg sm:text-xl font-serif mb-8 sm:mb-12 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-4 sm:pb-6 italic">
                                1. {t('personal_data')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-12 bg-[#2D3419]/30 border border-[#c9a56a]/20">
                                <div className="space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('full_name_placeholder')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('full_name_placeholder')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('email_placeholder')}</label>
                                    <input 
                                        type="email" 
                                        placeholder={t('email_placeholder')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('phone_placeholder')}</label>
                                    <input 
                                        type="tel" 
                                        placeholder={t('phone_placeholder')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]/60 mb-4">{t('order_comment')}</label>
                                    <textarea 
                                        placeholder={t('order_comment_placeholder')}
                                        rows={2}
                                        className="w-full bg-[#150e03]/50 border border-[#c9a56a]/20 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-[#444444]" 
                                        value={formData.comment}
                                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Shipping Address */}
                        <section>
                            <h2 className="text-lg sm:text-xl font-serif mb-8 sm:mb-12 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-4 sm:pb-6 italic">
                                2. {t('shipping_details')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 p-5 sm:p-12 bg-[#2D3419]/30 border border-[#c9a56a]/20">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('postcode')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('postcode')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.shippingPostcode}
                                        onChange={(e) => setFormData({...formData, shippingPostcode: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-4 space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('city')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('city')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.shippingCity}
                                        onChange={(e) => setFormData({...formData, shippingCity: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-6 space-y-3">
                                    <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('street_address')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('street_address')}
                                        required 
                                        className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                        value={formData.shippingAddress}
                                        onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. Billing Address */}
                        <section>
                            <h2 className="text-xl font-serif mb-12 uppercase tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-6 italic">
                                3. {t('billing_details')}
                            </h2>
                            <div className="space-y-6 p-5 sm:p-12 bg-[#2D3419]/30 border border-[#c9a56a]/10">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.billingSameAsShipping}
                                        onChange={(e) => setFormData({...formData, billingSameAsShipping: e.target.checked})}
                                        className="w-6 h-6 border-[#c9a56a]/40 bg-[#150e03] accent-[#c9a56a]"
                                    />
                                    <span className="text-sm uppercase tracking-[0.2em] font-black text-[#fdfdf3]/60 group-hover:text-[#c9a56a] transition-colors">
                                        {t('billing_matches_shipping')}
                                    </span>
                                </label>

                                {!formData.billingSameAsShipping && (
                                    <div className="space-y-8 pt-8 border-t border-[#c9a56a]/10 animate-in fade-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                            <div className="space-y-3">
                                                <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('billing_name')}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={t('billing_name')}
                                                    required={!formData.billingSameAsShipping}
                                                    className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                                    value={formData.billingName}
                                                    onChange={(e) => setFormData({...formData, billingName: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="checkbox" 
                                                    id="isCompany"
                                                    checked={formData.isCompany}
                                                    onChange={(e) => setFormData({...formData, isCompany: e.target.checked})}
                                                    className="w-6 h-6 border-[#c9a56a]/40 bg-[#150e03] accent-[#c9a56a]"
                                                />
                                                <label htmlFor="isCompany" className="text-sm uppercase tracking-[0.2em] font-black text-[#fdfdf3]/60 cursor-pointer">{t('company_billing')}</label>
                                            </div>
                                        </div>

                                        {formData.isCompany && (
                                            <div className="space-y-3">
                                                <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('tax_number')}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={t('tax_number')}
                                                    required={formData.isCompany}
                                                    className="w-full md:w-1/2 bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20 animate-in zoom-in-95 duration-200" 
                                                    value={formData.taxNumber}
                                                    onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('postcode')}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={t('postcode')}
                                                    required={!formData.billingSameAsShipping}
                                                    className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                                    value={formData.billingPostcode}
                                                    onChange={(e) => setFormData({...formData, billingPostcode: e.target.value})}
                                                />
                                            </div>
                                            <div className="md:col-span-4 space-y-3">
                                                <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('city')}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={t('city')}
                                                    required={!formData.billingSameAsShipping}
                                                    className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                                    value={formData.billingCity}
                                                    onChange={(e) => setFormData({...formData, billingCity: e.target.value})}
                                                />
                                            </div>
                                            <div className="md:col-span-6 space-y-3">
                                                <label className="block text-sm uppercase tracking-[0.3em] font-black text-[#c9a56a]">{t('street_address')}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={t('street_address')}
                                                    required={!formData.billingSameAsShipping}
                                                    className="w-full bg-[#150e03] border border-[#c9a56a]/30 p-5 outline-none focus:border-[#c9a56a] text-lg font-serif text-[#fdfdf3] placeholder:text-ivory/20" 
                                                    value={formData.billingAddress}
                                                    onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 4. Shipping Method */}
                        <section id="shipping-method-section">
                            <h2 className="text-lg sm:text-xl font-serif mb-8 sm:mb-12 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-4 sm:pb-6 italic">
                                4. {t('shipping_method')}
                            </h2>
                            <div className="space-y-6">
                                {shippingOptions.map((option) => (
                                    <div key={option.id} className="space-y-4">
                                        <label 
                                            className={`relative flex items-center justify-between flex-wrap gap-4 p-5 sm:p-10 border cursor-pointer transition-all ${
                                                shipping.id === option.id ? 'border-[#c9a56a] bg-[#2D3419]/50' : 'border-[#c9a56a]/10 bg-[#2D3419]/10 hover:border-[#c9a56a]/40'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="shipping" 
                                                className="sr-only" 
                                                checked={shipping.id === option.id}
                                                onChange={() => {
                                                    setShipping(option);
                                                    if (option.id !== 'mpl-box') setSelectedMplPoint(null);
                                                }}
                                            />
                                            <div className="flex items-center gap-8">
                                                <div className={`p-4 rounded-full ${shipping.id === option.id ? 'bg-[#c9a56a] text-[#150e03]' : 'bg-[#150e03] text-[#333333]'}`}>
                                                    <option.icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base text-[#fdfdf3] uppercase tracking-[0.2em]">{option.name}</p>
                                                    <p className="text-sm text-[#999999] italic mt-2 tracking-wide">{option.description}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm text-[#c9a56a] tracking-[0.1em]">
                                                {option.price === 0 ? t('free_label') : formatPrice(option.price)}
                                            </p>
                                        </label>

                                        {option.id === 'mpl-box' && shipping.id === 'mpl-box' && (
                                            <div className="p-8 bg-[#c9a56a]/5 border border-[#c9a56a]/20 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                                {!selectedMplPoint ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsMplSelectorOpen(true)}
                                                        className="w-full py-4 border-2 border-dashed border-[#c9a56a]/40 text-[#c9a56a] rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:bg-[#c9a56a]/10 transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                        {t('shipping_mpl_box_select')}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsMplSelectorOpen(true)}
                                                        className="w-full flex items-center justify-between hover:bg-[#c9a56a]/5 p-2 -m-2 rounded-xl transition-all group text-left"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-[#c9a56a] p-2 rounded-lg text-[#150e03] group-hover:scale-110 transition-transform">
                                                                <MapPin className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase tracking-widest text-[#c9a56a]">{t('shipping_mpl_box_selected')}</p>
                                                                <p className="text-sm text-[#fdfdf3] font-bold mt-1 group-hover:text-gold transition-colors">{selectedMplPoint.name}</p>
                                                                <p className="text-xs text-[#666666] uppercase mt-0.5">{selectedMplPoint.city}, {selectedMplPoint.address}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-[#c9a56a] group-hover:underline">
                                                            Módosítás
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {option.id === 'foxpost-box' && shipping.id === 'foxpost-box' && (
                                            <div className="p-8 bg-[#c9a56a]/5 border border-[#c9a56a]/20 rounded-2xl animate-in fade-in slide-in-from-top-4 space-y-3">
                                                {!formData.foxpostMachine ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsFoxpostSelectorOpen(true)}
                                                        className="w-full py-4 border-2 border-dashed border-[#c9a56a]/40 text-[#c9a56a] rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:bg-[#c9a56a]/10 transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                        Foxpost Automata kiválasztása
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsFoxpostSelectorOpen(true)}
                                                        className="w-full flex items-center justify-between hover:bg-[#c9a56a]/5 p-2 -m-2 rounded-xl transition-all group text-left"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-[#c9a56a] p-2 rounded-lg text-[#150e03] group-hover:scale-110 transition-transform">
                                                                <MapPin className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase tracking-widest text-[#c9a56a]">Kiválasztott automata</p>
                                                                <p className="text-sm text-[#fdfdf3] font-bold mt-1 group-hover:text-gold transition-colors">{formData.foxpostMachine.includes(' - ') ? formData.foxpostMachine.split(' - ')[0] : formData.foxpostMachine}</p>
                                                                {formData.foxpostMachine.includes(' - ') && (
                                                                    <p className="text-xs text-[#666666] uppercase mt-0.5">{formData.foxpostMachine.split(' - ')[1]}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-[#c9a56a] group-hover:underline">
                                                            Módosítás
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 5. Payment Method */}
                        <section id="payment-method-section">
                            <h2 className="text-xl font-serif mb-12 uppercase tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-6 italic">
                                5. {t('payment_method')}
                            </h2>
                            <div className="space-y-6">
                                {paymentOptions.map((option) => (
                                    <div key={option.id} className="space-y-4">
                                        <label 
                                            className={`relative flex items-center justify-between flex-wrap gap-4 p-5 sm:p-10 border cursor-pointer transition-all ${
                                                payment.id === option.id ? 'border-[#c9a56a] bg-[#2D3419]/50' : 'border-[#c9a56a]/10 bg-[#2D3419]/10 hover:border-[#c9a56a]/40'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="payment" 
                                                className="sr-only" 
                                                checked={payment.id === option.id}
                                                onChange={() => setPayment(option)}
                                            />
                                            <div className="flex items-center gap-8">
                                                <div className={`p-4 rounded-full ${payment.id === option.id ? 'bg-[#c9a56a] text-[#150e03]' : 'bg-[#150e03] text-[#333333]'}`}>
                                                    <option.icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base text-[#fdfdf3] uppercase tracking-[0.2em]">{option.name}</p>
                                                    <p className="text-sm text-[#999999] italic mt-2 tracking-wide">{option.description}</p>
                                                </div>
                                            </div>
                                        </label>

                                        {option.id === 'inperson' && payment.id === 'inperson' && (
                                            <div className="p-8 bg-[#c9a56a]/5 border border-[#c9a56a]/20 rounded-2xl animate-in fade-in slide-in-from-top-4 space-y-4 text-center">
                                                <MapPin className="h-8 w-8 text-[#c9a56a] mx-auto mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest text-[#fdfdf3]">Személyes átvétel és fizetés</p>
                                                <p className="text-sm text-[#999999] leading-relaxed">
                                                    Az elkészült ékszert személyesen veheti át üzletünkben és ott fizet készpénzzel vagy bankkártyával.
                                                </p>
                                            </div>
                                        )}

                                        {option.id === 'transfer' && payment.id === 'transfer' && (
                                            <div className="p-8 bg-[#c9a56a]/5 border border-[#c9a56a]/20 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                                <div className="space-y-4">
                                                    <p className="text-sm font-black uppercase tracking-widest text-[#c9a56a] mb-4">Utaláshoz szükséges adatok:</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-xs text-[#666666] uppercase tracking-wider">Kedvezményezett</p>
                                                            <p className="text-sm text-[#fdfdf3] font-bold mt-1">MARTIN'S BT.</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#666666] uppercase tracking-wider">Bank</p>
                                                            <p className="text-sm text-[#fdfdf3] font-bold mt-1">{t('bank_name')}</p>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <p className="text-xs text-[#666666] uppercase tracking-wider">Számlaszám</p>
                                                            <p className="text-xl md:text-2xl text-[#c9a56a] font-black mt-2 tracking-widest">{t('bank_account')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#666666] uppercase tracking-wider">IBAN</p>
                                                            <p className="text-sm text-[#fdfdf3] font-bold mt-1">{t('bank_iban')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#666666] uppercase tracking-wider">SWIFT</p>
                                                            <p className="text-sm text-[#fdfdf3] font-bold mt-1">{t('bank_swift')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-[#c9a56a]/10">
                                                        <p className="text-sm text-[#999999] italic leading-relaxed">
                                                            Kérjük, a közlemény rovatba írja be a rendelés azonosítóját, amit a visszaigazoló e-mailben fog megkapni.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 6. Gift Box Options */}
                        <section>
                            <h2 className="text-xl font-serif mb-12 uppercase tracking-[0.3em] text-[#c9a56a] border-b border-[#c9a56a]/10 pb-6 italic">
                                6. Díszdoboz
                            </h2>
                            <div className="space-y-6">
                                <label 
                                    className={`relative flex items-center justify-between p-10 border cursor-pointer transition-all ${
                                        !isPremiumBoxSelected ? 'border-[#c9a56a] bg-[#2D3419]/50' : 'border-[#c9a56a]/10 bg-[#2D3419]/10 hover:border-[#c9a56a]/40'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="giftbox" 
                                        className="sr-only" 
                                        checked={!isPremiumBoxSelected}
                                        onChange={() => setIsPremiumBoxSelected(false)}
                                    />
                                     <div className="flex items-center gap-8">
                                        <div className={`p-4 rounded-full ${!isPremiumBoxSelected ? 'bg-[#c9a56a] text-[#150e03]' : 'bg-[#150e03] text-[#333333]'}`}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-[#fdfdf3] uppercase tracking-[0.2em]">Alap csomagolás</p>
                                            <p className="text-sm text-[#999999] italic mt-2 tracking-wide font-serif">Klasszikus, igényes csomagolás minden ékszerünkhöz.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-black text-sm text-[#c9a56a] tracking-[0.1em]">Ingyenes</p>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setPreviewModal({ isOpen: true, src: imageSettings.standard_box, title: 'Alap csomagolás bemutatása' });
                                            }}
                                            className="p-3 bg-[#150e03] border border-[#c9a56a]/30 rounded-full text-[#c9a56a] hover:scale-110 transition-transform shadow-lg"
                                            title="Kép megtekintése"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </label>

                                <label 
                                    className={`relative flex items-center justify-between p-10 border cursor-pointer transition-all ${
                                        isPremiumBoxSelected ? 'border-[#c9a56a] bg-[#2D3419]/50' : 'border-[#c9a56a]/10 bg-[#2D3419]/10 hover:border-[#c9a56a]/40'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="giftbox" 
                                        className="sr-only" 
                                        checked={isPremiumBoxSelected}
                                        onChange={() => setIsPremiumBoxSelected(true)}
                                    />
                                    <div className="flex items-center gap-8">
                                        <div className={`p-4 rounded-full ${isPremiumBoxSelected ? 'bg-[#c9a56a] text-[#150e03]' : 'bg-[#150e03] text-[#333333]'}`}>
                                            <Star className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-[#fdfdf3] uppercase tracking-[0.2em]">Prémium Díszdoboz</p>
                                            <p className="text-sm text-[#999999] italic mt-2 tracking-wide font-serif">Különleges, extra minőségű díszdoboz az ünnepi pillanatokhoz.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-black text-sm text-[#c9a56a] tracking-[0.1em]">+{formatPrice(premiumBoxPrice)}</p>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setPreviewModal({ isOpen: true, src: imageSettings.premium_box, title: 'Prémium Díszdoboz bemutatása' });
                                            }}
                                            className="p-3 bg-[#150e03] border border-[#c9a56a]/30 rounded-full text-[#c9a56a] hover:scale-110 transition-transform shadow-lg"
                                            title="Kép megtekintése"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Summary Section */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-[#2D3419] text-[#fdfdf3] p-6 sm:p-12 lg:sticky lg:top-24 shadow-2xl border border-[#c9a56a]/10">
                            <h3 className="text-xl font-serif mb-12 border-b border-[#c9a56a]/20 pb-8 uppercase tracking-[0.4em] text-center italic">{t('order_summary')}</h3>
                            
                            <div className="space-y-8 mb-16 border-b border-[#c9a56a]/10 pb-12">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm uppercase tracking-widest text-[#999999]">
                                        <div className="flex flex-col">
                                            <span>{item.name} x {item.quantity}</span>
                                            {item.selectedCustomization && (
                                                <span className="text-[#c9a56a] italic lowercase tracking-normal mt-1">{item.selectedCustomization}</span>
                                            )}
                                        </div>
                                        <span className="text-[#fdfdf3] font-bold">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}

                                {isPremiumBoxSelected && (
                                    <div className="flex justify-between items-center text-sm uppercase tracking-widest text-[#c9a56a] bg-[#c9a56a]/10 p-4 border border-[#c9a56a]/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#150e03] flex items-center justify-center border border-[#c9a56a]/20">
                                                <Star className="h-3 w-3" />
                                            </div>
                                            <span className="font-black">Prémium Díszdoboz</span>
                                        </div>
                                        <span className="font-bold">{formatPrice(premiumBoxPrice)}</span>
                                    </div>
                                )}


                                {/* Coupon Section */}
                                <div className="pt-8 border-t border-[#c9a56a]/10 mt-8">
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Kuponkód"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleApplyCoupon(e as any);
                                                    }
                                                }}
                                                className="flex-1 bg-black/40 border border-[#c9a56a]/20 p-3 text-sm uppercase font-black tracking-widest text-[#fdfdf3] outline-none focus:border-[#c9a56a] transition-all"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                className="bg-[#c9a56a] text-[#150e03] px-4 py-2 text-sm font-black uppercase tracking-widest hover:bg-[#b08d55] transition-all"
                                            >
                                                Ok
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-[#c9a56a]/5 p-3 border border-[#c9a56a]/20">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-3 w-3 text-[#c9a56a]" />
                                                <span className="text-sm font-black uppercase tracking-widest text-[#c9a56a]">{appliedCoupon.code}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-[#999999] hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    {couponError && <p className="text-xs text-red-500 mt-2 font-bold uppercase tracking-widest italic">{couponError}</p>}
                                </div>
                            </div>

                            <div className="space-y-8 text-sm uppercase font-black tracking-[0.3em] mb-16">
                                <div className="flex justify-between text-[#555555]">
                                    <span>{t('products_label')}</span>
                                    <span>{formatPrice(baseTotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-[#c9a56a]">
                                        <span>Csomagkedvezmény (Kollekció)</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[#555555]">
                                    <span>{t('shipping')}</span>
                                    <span>{formatPrice(shipping.price)}</span>
                                </div>
                                <div className="pt-12 flex justify-between text-[22px] font-black text-[#fdfdf3] tracking-[0.1em] border-t border-[#c9a56a]/20">
                                    <span>{t('total')}</span>
                                    <span className="text-[#c9a56a]">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="pt-1">
                                            <input 
                                                type="checkbox" 
                                                id="marketingConsent"
                                                checked={marketingConsent}
                                                onChange={(e) => setMarketingConsent(e.target.checked)}
                                                className="w-5 h-5 border-[#c9a56a]/40 bg-[#150e03] accent-[#c9a56a] cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="marketingConsent" className="text-sm font-serif text-ivory/70 leading-relaxed cursor-pointer select-none">
                                            Hozzájárulok, hogy a <span className="text-gold font-bold">MagyarÉkszer</span> hírleveleket, egyedi ajánlatokat és marketing tartalmú megkereséseket küldjön az e-mail címemre. Bármikor leiratkozhatok.
                                        </label>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-[#c9a56a]/5 border border-[#c9a56a]/10 rounded-xl">
                                        <div className="pt-1">
                                            <input 
                                                type="checkbox" 
                                                id="termsAccepted"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="w-5 h-5 border-[#c9a56a]/40 bg-[#150e03] accent-[#c9a56a] cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="termsAccepted" className="text-xs font-serif text-[#fdfdf3] leading-relaxed cursor-pointer select-none">
                                            Elolvastam és elfogadom az <Link href="/terms" className="text-[#c9a56a] underline hover:text-[#b08d55] mx-1">Általános Szerződési Feltételeket</Link> és az <Link href="/privacy" className="text-[#c9a56a] underline hover:text-[#b08d55] mx-1">Adatkezelési Tájékoztatót</Link>. *
                                        </label>
                                    </div>

                                    {formErrors && (
                                        <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-red-500 font-bold text-center text-sm uppercase tracking-widest">
                                            {formErrors}
                                        </div>
                                    )}
                                    <button 
                                        type="submit"
                                        className="w-full bg-[#c9a56a] text-[#150e03] py-6 font-black uppercase tracking-[0.4em] text-sm hover:bg-[#b08d55] transition-all shadow-xl shadow-[#c9a56a]/10 active:scale-[0.98]"
                                    >
                                        {t('place_order')}
                                    </button>
                                </div>
                            
                            <div className="mt-8 flex flex-col items-center gap-4 text-[8px] text-[#333333] uppercase tracking-[0.4em] font-black italic">
                                <div className="flex gap-6 border-t border-[#c9a56a]/5 pt-6 w-full justify-center">
                                    <span>{t('workshop_security')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <MplPointSelector 
                    isOpen={isMplSelectorOpen}
                    onClose={() => setIsMplSelectorOpen(false)}
                    onSelect={(point) => {
                        setSelectedMplPoint(point);
                        setIsMplSelectorOpen(false);
                    }}
                />

                <FoxpostSelector 
                    isOpen={isFoxpostSelectorOpen}
                    onClose={() => setIsFoxpostSelectorOpen(false)}
                    onSelect={(machine) => {
                        setFormData({...formData, foxpostMachine: `${machine.name} - ${machine.zip} ${machine.city}, ${machine.address}`});
                        setIsFoxpostSelectorOpen(false);
                    }}
                />

                <ImagePreviewModal 
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                    imageSrc={previewModal.src}
                    title={previewModal.title}
                />
            </div>
        </main>
    );
}
