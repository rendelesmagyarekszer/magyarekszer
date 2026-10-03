"use client";

import React, { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Scale, BadgeCheck, Phone, AlertCircle, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImagePreviewModal from '@/components/ImagePreviewModal';

interface ProductClientProps {
    product: any;
    initialCollectionProducts: any[];
}

export default function ProductClient({ product: serverProduct, initialCollectionProducts }: ProductClientProps) {
    const { addToCart } = useCart();
    const { 
        products, collections, language, t, formatPrice, currency,
        ankerPrices, barbaraPrices, vacationMode,
        availableStones, stonePrices, imageSettings, globalEnamelColors
    } = useConfig();
    
    // Find enriched version from config (localStorage) or fallback to server prop
    const product = products.find(p => p.id === serverProduct.id) || serverProduct;

    const displayName = language === 'EN' && product.nameEn ? product.nameEn : product.name;
    const displayDescription = language === 'EN' && product.descriptionEn ? product.descriptionEn : product.description;
    const displayHistory = language === 'EN' && product.historyEn ? product.historyEn : product.history;

    const activeCollectionProducts = React.useMemo(() => {
        if (!product || !product.collectionId) return [];
        return products.filter(p => p.collectionId === product.collectionId && p.id !== product.id);
    }, [product, products]);

    const collection = collections.find(c => c.id === product.collectionId);
    
    const [isExpanded, setIsExpanded] = useState(true);
    const [customization, setCustomization] = useState('');
    const [useCustomSize, setUseCustomSize] = useState(false);
    const [customSizeValue, setCustomSizeValue] = useState('');
    const [customLeatherValue, setCustomLeatherValue] = useState('');
    const [useCustomLeather, setUseCustomLeather] = useState(false);
    
    const [accessoryType, setAccessoryType] = useState<'chain' | 'leather' | 'none'>('none');
    const [chainLength, setChainLength] = useState<'40' | '42' | '45' | '50' | '55'>('45');
    const [chainType, setChainType] = useState<'anker' | 'barbara'>('anker');
    const [leatherColor, setLeatherColor] = useState<'fekete' | 'barna'>('fekete');
    const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [goldModalError, setGoldModalError] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [selectedStone, setSelectedStone] = useState<string | null>(null);
    const [selectedEnamelColors, setSelectedEnamelColors] = useState<string[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [validationError, setValidationError] = useState<string|null>(null);
    const [leatherHasClasp, setLeatherHasClasp] = useState(false);

    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, src: string, title: string }>({
        isOpen: false,
        src: '',
        title: ''
    });

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const allImages = [product.image, ...(product.additionalImages || [])];
    const currentImage = allImages[selectedImageIndex] || product.image;

    const [ringSelectionMode, setRingSelectionMode] = useState<'pair' | 'single-female' | 'single-male'>('pair');
    const [femaleRingSize, setFemaleRingSize] = useState('');
    const [maleRingSize, setMaleRingSize] = useState('');
    const [femaleCustomValue, setFemaleCustomValue] = useState('');
    const [maleCustomValue, setMaleCustomValue] = useState('');
    const [isFemaleCustom, setIsFemaleCustom] = useState(false);
    const [isMaleCustom, setIsMaleCustom] = useState(false);

    const [labDiamondSize, setLabDiamondSize] = useState('0.50ct');
    const [goldColor, setGoldColor] = useState('gold_white');

    const stoneOptions = availableStones || [];
    const isNecklaceOrMedallion = product ? (product.category === 'nyaklancok' || product.category === 'medallok' || product.category === 'noi-lancok' || product.category === 'medalok-es-talizmanok') : false;
    const isKolie = product ? (product.isKolie || product.name.toLowerCase().includes('kolié') || product.name.toLowerCase().includes('kolie')) : false;

    React.useEffect(() => {
        if (isKolie) {
            if (!['40', '42', '45', '50', '55'].includes(chainLength)) {
                setChainLength('42');
            }
        }
    }, [isKolie, chainLength]);

    const isMedalCategory = product?.category === 'medalok-es-talizmanok';
    const isKoves = product.allowsStone || product.name.toLowerCase().includes('köves') || product.name.toLowerCase().includes('koves');
    const isWeddingPair = (product.category === 'eljegyzesi-es-karikagyuruk' || product.category === 'eljegyzesi-gyuruk') && product.price === 89000;

    const getChainPriceOptions = () => {
        if (isMedalCategory && chainType === 'barbara') {
            return barbaraPrices;
        }
        return ankerPrices;
    };

    const currentChainPrices = getChainPriceOptions();

    const getFinalCustomization = () => {
        let parts = [];
        if (isWeddingPair) {
            if (ringSelectionMode === 'pair') {
                const female = isFemaleCustom ? `Női: ${femaleCustomValue}` : `Női: ${femaleRingSize}`;
                const male = isMaleCustom ? `Férfi: ${maleCustomValue}` : `Férfi: ${maleRingSize}`;
                parts.push(`Párban (${female}, ${male})`);
            } else if (ringSelectionMode === 'single-female') {
                const female = isFemaleCustom ? `Női: ${femaleCustomValue}` : `Női: ${femaleRingSize}`;
                parts.push(`Csak női gyűrű (${female})`);
            } else {
                const male = isMaleCustom ? `Férfi: ${maleCustomValue}` : `Férfi: ${maleRingSize}`;
                parts.push(`Csak férfi gyűrű (${male})`);
            }
        } else {
            if (useCustomSize && customSizeValue) {
                parts.push(`${t('custom_size')}: ${customSizeValue}`);
            } else if (customization) {
                parts.push(customization);
            }
        }
        
        if (isNecklaceOrMedallion) {
            if (isKolie) {
                parts.push(`${chainLength} cm lánccal (kolié)`);
            } else {
                if (accessoryType === 'chain') {
                    if (isMedalCategory) {
                        parts.push(`${chainLength} cm ezüst lánccal (${chainType === 'barbara' ? 'Barbara' : 'Anker'} típus)`);
                    } else {
                        parts.push(`${chainLength} cm ezüst lánccal`);
                    }
                }
                if (accessoryType === 'leather') {
                    if (leatherHasClasp) {
                        const length = useCustomLeather ? customLeatherValue : chainLength;
                        parts.push(`Bőr lánc ezüst zárral (${length} cm)`);
                    } else {
                        parts.push(`${t('accessory_leather')} (csoki barna)`);
                    }
                }
            }
        }

        if (product.isEnamel && selectedEnamelColors.length > 0) {
            parts.push(`Zománc: ${selectedEnamelColors.join(' + ')}`);
        }
        
        if (product.category === 'ferfi-ekszerek' && product.name.toLowerCase().includes('bőr')) {
            parts.push(`Bőr színe: ${leatherColor === 'fekete' ? 'Fekete' : 'Csoki Barna'}`);
        }
        if (selectedStone) {
            parts.push(`Kő: ${t(selectedStone)}`);
        }
        if (product.isGoldEngagementRing) {
            parts.push(`Arany színe: ${t(goldColor)}`);
            parts.push(`Lab Diamond méret: ${labDiamondSize}`);
        }
        return parts.join(', ');
    };

    const getDisplayPrice = () => {
        let total = product.price;
        if (isWeddingPair && ringSelectionMode !== 'pair') {
            total = 45000;
        }
        if (isNecklaceOrMedallion && !isKolie) {
            if (accessoryType === 'chain') {
                total += (currentChainPrices[chainLength] || 0);
            } else if (accessoryType === 'leather') {
                if (leatherHasClasp) total += 8000;
            }
        }
        if (selectedStone && stonePrices) {
            const stonePrice = stonePrices[selectedStone];
            if (stonePrice !== undefined) {
                total += stonePrice;
            }
        }
        return total;
    };

    const displayPrice = getDisplayPrice();

    const validateSelection = (): boolean => {
        if (isWeddingPair) {
            if (ringSelectionMode === 'pair') {
                if ((!femaleRingSize && !femaleCustomValue) || (!maleRingSize && !maleCustomValue)) {
                    setValidationError('Kérjük, válassz méretet mindkét gyűrűhöz!');
                    return false;
                }
            } else if (ringSelectionMode === 'single-female') {
                if (!femaleRingSize && !femaleCustomValue) {
                    setValidationError('Kérjük, válassz méretet a női gyűrűhöz!');
                    return false;
                }
            } else if (ringSelectionMode === 'single-male') {
                if (!maleRingSize && !maleCustomValue) {
                    setValidationError('Kérjük, válassz méretet a férfi gyűrűhöz!');
                    return false;
                }
            }
        } else {
            const isSizeRequired = product.isGoldEngagementRing || product.category === 'gyuruk' || product.category === 'eljegyzesi-es-karikagyuruk' || product.category === 'eljegyzesi-gyuruk' || product.category === 'karkotok' || product.category === 'karperecek';
            if (isSizeRequired && !customization && (!useCustomSize || !customSizeValue.trim())) {
                setValidationError('Kérjük, válassz méretet a rendelés leadásához!');
                return false;
            }
        }
        
        if (isKoves && !selectedStone) {
            setValidationError('Kérjük, válassz követ a rendelés leadásához!');
            return false;
        }

        if (product.isEnamel) {
            const requiredCount = product.enamelRequiredCount || 1;
            if (selectedEnamelColors.length < requiredCount) {
                setValidationError(t(`select_enamel_colors_${requiredCount}`));
                return false;
            }
        }

        if (isKolie || (accessoryType === 'chain') || (accessoryType === 'leather' && leatherHasClasp)) {
            const currentLen = (accessoryType === 'leather' && leatherHasClasp && useCustomLeather) ? customLeatherValue : chainLength;
            if (!currentLen) {
                setValidationError('Kérjük, válassz vagy írj be lánchosszúságot!');
                return false;
            }
        }
        return true;
    };

    const handleGoldRequest = () => {
        if (!validateSelection()) return;
        if (!userName.trim() || !userEmail.trim()) {
            setGoldModalError('Kérjük, adja meg a nevét és az e-mail címét!');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            setGoldModalError('Kérjük, adjon meg egy érvényes e-mail címet!');
            return;
        }
        setGoldModalError('');

        const subject = product.isGoldEngagementRing || product.isGoldOnly 
            ? `Árajánlatkérés: ${displayName} (#${product.sku})`
            : `Arany ékszer ajánlatkérés: ${displayName} (#${product.sku})`;
            
        const introText = product.isGoldEngagementRing || product.isGoldOnly
            ? "Szeretnék egyedi árajánlatot kérni az alábbi termékre:"
            : t('gold_template_intro');
            
        const body = `${introText}\n\n` +
                    `${t('gold_template_body')}\n\n` +
                    `${t('product_label')}: ${displayName}\n` +
                    `${t('sku')}: ${product.sku}\n` +
                    `${t('size')}: ${getFinalCustomization() || t('standard_size')}\n\n` +
                    `${t('gold_template_outro')}\n\n` +
                    `Ajánlatkérésre megadott e-mail cím:\n` +
                    `${userEmail}\n\n` +
                    `${t('best_regards')}\n` +
                    `${userName}`;
        
        window.location.href = `mailto:magyarekszer@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setIsGoldModalOpen(false);
    };

    return (
        <main className="w-full bg-deep-brown text-ivory min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
                <Link href="/" className="inline-flex items-center text-xs text-ivory/60 hover:text-gold transition-colors uppercase tracking-[0.3em] font-bold mb-12 group/back">
                    <ArrowLeft className="h-4 w-4 mr-3 transition-transform group-hover/back:-translate-x-1" />
                    {t('back_to_products')}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 gap-x-0 lg:gap-x-16 lg:gap-y-0">
                    {/* Image Column */}
                    <div className="lg:col-span-7 order-1 relative">
                        <div 
                            className="max-w-md mx-auto relative aspect-square w-full overflow-hidden rounded-3xl premium-card group shadow-2xl border border-gold/10 cursor-pointer"
                            onClick={() => setIsImageModalOpen(true)}
                        >
                            <Image 
                                src={currentImage} 
                                alt={displayName} 
                                fill 
                                className="object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/40 to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-ivory text-[9px] font-bold uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-gold/20 backdrop-blur-md">Kattints a nagyításhoz</span>
                            </div>
                            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-gold/20 px-4 py-2 rounded-full">
                                <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Ezüst 925</span>
                            </div>
                        </div>

                        {allImages.length > 1 && (
                            <div className="max-w-md mx-auto mt-4 grid grid-cols-5 gap-3">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-gold opacity-100 scale-105' : 'border-gold/10 opacity-60 hover:opacity-100 hover:border-gold/50'}`}
                                    >
                                        <Image src={img} alt={`${displayName} thumbnail ${idx + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div 
                            onClick={() => window.location.href="tel:+36208074841"}
                            className="max-w-md mx-auto mt-6 bg-[#c9a56a] p-6 rounded-3xl flex items-center justify-center gap-6 shadow-[0_0_40px_rgba(201,165,106,0.3)] hover:scale-[1.03] transition-all text-[#150e03] cursor-pointer text-center sm:text-left sm:flex-row flex-col"
                        >
                            <div className="bg-[#150e03] p-4 rounded-full text-[#c9a56a] scale-110">
                                <Phone className="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] font-black mb-1 opacity-80">Kérdése van a termékkel kapcsolatban?</p>
                                <div className="text-xl sm:text-2xl font-black tracking-widest font-serif block">06-20-807-4841</div>
                            </div>
                        </div>
                    </div>

                    {/* Buy Box */}
                    <div className="lg:col-span-5 order-2 lg:row-span-3 relative mb-8 lg:mb-0">
                        <div className="sticky top-32 space-y-10">
                            <div className="bg-black/30 backdrop-blur-xl border border-gold/30 p-10 md:p-12 rounded-[2rem] shadow-2xl flex flex-col space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] border-b border-gold/20 pb-2 inline-block">
                                            {t(`cat_${product.category}`)}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-serif text-ivory tracking-tight leading-tight">{displayName}</h1>
                                    
                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2.5 rounded-xl">
                                            <span className="text-[8px] text-gold font-black uppercase tracking-[0.1em]">Cikkszám:</span>
                                            <span className="text-[10px] text-ivory font-black uppercase tracking-widest">{product.sku}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/20 px-3 py-2.5 rounded-xl">
                                            <Scale className="h-3 w-3 text-gold/80" />
                                            <span className="text-[9px] text-ivory/90 font-black uppercase tracking-widest">{product.weight}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/20 px-3 py-2.5 rounded-xl">
                                            <BadgeCheck className="h-3 w-3 text-gold/80" />
                                            <span className="text-[8px] text-gold/80 font-black uppercase tracking-widest">EZÜST 925</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 pt-4">
                                    {/* Leather Color Selection for specific categories */}
                                    {product.category === 'ferfi-ekszerek' && product.name.toLowerCase().includes('bőr') && (
                                        <div className="space-y-4">
                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">Bőr Színe</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => setLeatherColor('fekete')} className={`py-4 text-xs font-black transition-all border rounded-xl flex items-center justify-center gap-3 ${leatherColor === 'fekete' ? 'bg-gold border-gold text-deep-brown' : 'border-gold/20 text-gold/60'}`}>Fekete</button>
                                                <button onClick={() => setLeatherColor('barna')} className={`py-4 text-xs font-black transition-all border rounded-xl flex items-center justify-center gap-3 ${leatherColor === 'barna' ? 'bg-gold border-gold text-deep-brown' : 'border-gold/20 text-gold/60'}`}>Csoki Barna</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Selection (Rings & Bracelets) */}
                                    {(product.isGoldEngagementRing || product.category === 'gyuruk' || product.category === 'eljegyzesi-es-karikagyuruk' || product.category === 'eljegyzesi-gyuruk' || product.category === 'karkotok' || product.category === 'karperecek') && (
                                        <div className="space-y-8">
                                            {isWeddingPair ? (
                                                <div className="space-y-10">
                                                    {/* Mode Selection */}
                                                    <div className="space-y-4">
                                                        <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">Választás Típusa</label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <button onClick={() => setRingSelectionMode('pair')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${ringSelectionMode === 'pair' ? 'border-gold bg-gold/5 text-gold' : 'border-gold/30 text-ivory/70'}`}>
                                                                <span>Karikagyűrű Pár</span>
                                                                <span className="font-serif">89 000 Ft</span>
                                                            </button>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => setRingSelectionMode('single-female')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${ringSelectionMode === 'single-female' ? 'border-gold bg-gold/5 text-gold' : 'border-gold/30 text-ivory/70'}`}>
                                                                    <span>Csak Női</span>
                                                                    <span className="font-serif">45 000 Ft</span>
                                                                </button>
                                                                <button onClick={() => setRingSelectionMode('single-male')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${ringSelectionMode === 'single-male' ? 'border-gold bg-gold/5 text-gold' : 'border-gold/30 text-ivory/70'}`}>
                                                                    <span>Csak Férfi</span>
                                                                    <span className="font-serif">45 000 Ft</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Female Size Selection */}
                                                    {(ringSelectionMode === 'pair' || ringSelectionMode === 'single-female') && (
                                                        <div className="space-y-4 p-6 bg-gold/5 border border-gold/10 rounded-2xl">
                                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold italic">Női Gyűrű Mérete</label>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {[48, 50, 52, 54, 56, 58, 60, 62].map((s) => (
                                                                    <button key={s} onClick={() => { setFemaleRingSize(s.toString()); setIsFemaleCustom(false); }} className={`py-3 text-[11px] font-black transition-all border rounded-lg ${!isFemaleCustom && femaleRingSize === s.toString() ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{s}</button>
                                                                ))}
                                                                <button onClick={() => { setIsFemaleCustom(true); setFemaleRingSize(''); }} className={`py-3 text-[10px] font-black transition-all border rounded-lg ${isFemaleCustom ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{t('custom_size')}</button>
                                                            </div>
                                                            {isFemaleCustom && (
                                                                <input type="text" value={femaleCustomValue} onChange={(e) => setFemaleCustomValue(e.target.value)} placeholder={t('custom_size_placeholder')} className="w-full bg-black/40 border border-gold/20 p-4 rounded-xl text-xs outline-none focus:border-gold text-ivory" />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Male Size Selection */}
                                                    {(ringSelectionMode === 'pair' || ringSelectionMode === 'single-male') && (
                                                        <div className="space-y-4 p-6 bg-gold/5 border border-gold/10 rounded-2xl">
                                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold italic">Férfi Gyűrű Mérete</label>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {[54, 56, 58, 60, 62, 64, 66, 68].map((s) => (
                                                                    <button key={s} onClick={() => { setMaleRingSize(s.toString()); setIsMaleCustom(false); }} className={`py-3 text-[11px] font-black transition-all border rounded-lg ${!isMaleCustom && maleRingSize === s.toString() ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{s}</button>
                                                                ))}
                                                                <button onClick={() => { setIsMaleCustom(true); setMaleRingSize(''); }} className={`py-3 text-[10px] font-black transition-all border rounded-lg ${isMaleCustom ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{t('custom_size')}</button>
                                                            </div>
                                                            {isMaleCustom && (
                                                                <input type="text" value={maleCustomValue} onChange={(e) => setMaleCustomValue(e.target.value)} placeholder={t('custom_size_placeholder')} className="w-full bg-black/40 border border-gold/20 p-4 rounded-xl text-xs outline-none focus:border-gold text-ivory" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('size')}</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {(product.isGoldEngagementRing || product.category === 'gyuruk' || product.category === 'eljegyzesi-es-karikagyuruk' || product.category === 'eljegyzesi-gyuruk' ? [48, 50, 52, 54, 56, 58, 60, 62] : [16, 17, 18, 19, 20, 21]).map((s) => {
                                                            const isBracelet = product.category === 'karkotok' || product.category === 'karperecek';
                                                            return (
                                                                <button key={s} onClick={() => { setCustomization(isBracelet ? `${s} cm-es méret` : `${s}-es méret`); setUseCustomSize(false); }} className={`py-3 text-[11px] font-black transition-all border rounded-lg ${!useCustomSize && customization.includes(s.toString()) ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{s}{isBracelet ? ' cm' : ''}</button>
                                                            );
                                                        })}
                                                        <button onClick={() => { setUseCustomSize(true); setCustomization(''); }} className={`py-3 text-[10px] font-black transition-all border rounded-lg ${useCustomSize ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{t('custom_size')}</button>
                                                    </div>
                                                    <div className="mt-4 bg-[#c9a56a]/10 border border-[#c9a56a]/30 p-4 rounded-xl flex gap-3 items-start">
                                                        <AlertCircle className="h-5 w-5 text-[#c9a56a] shrink-0 fill-[#150e03]" />
                                                        <p className="text-[10px] uppercase tracking-widest leading-relaxed font-black text-[#c9a56a]">
                                                            {product.category === 'karkotok' || product.category === 'karperecek' ? 'FONTOS! Kérjük, hogy a csuklódon pontosan körbeérő, azzal szorosan érintkező méretet add meg!' : 'FONTOS! Kérjük, hogy a pontos gyűrűméretet add meg!'}
                                                        </p>
                                                    </div>
                                                    {useCustomSize && (
                                                        <input type="text" value={customSizeValue} onChange={(e) => setCustomSizeValue(e.target.value)} placeholder={t('custom_size_placeholder')} className="w-full bg-black/40 border border-gold/20 p-4 rounded-xl text-xs outline-none focus:border-gold text-ivory transition-all placeholder:text-ivory/20 shadow-inner" autoFocus />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Necklace & Medallion Logic */}
                                    {displayDescription && (
                                        <p className="text-ivory/60 leading-relaxed text-sm lg:text-base font-light text-justify">
                                            {displayDescription}
                                        </p>
                                    )}

                                    {isNecklaceOrMedallion && (
                                        <div className="space-y-4">
                                            {!isKolie && (
                                                <>
                                                    <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('accessory_type')}</label>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <button onClick={() => setAccessoryType('none')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${accessoryType === 'none' ? 'border-gold bg-gold/5 text-gold' : 'border-gold/60 text-ivory/70'}`}>
                                                            <span>{t('accessory_none')}</span>
                                                            <span className="opacity-70">0 Ft</span>
                                                        </button>
                                                        <button onClick={() => setAccessoryType('leather')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${accessoryType === 'leather' ? 'border-gold bg-gold/5 text-gold shadow-lg shadow-gold/10' : 'border-gold/60 text-ivory/70'}`}>
                                                            <span>{t('accessory_leather')} (Csoki Barna)</span>
                                                            <span className="opacity-70">0 Ft</span>
                                                        </button>
                                                        {accessoryType === 'leather' && (
                                                            <div className="p-2 bg-black/20 rounded-xl space-y-2 mt-2 border border-gold/10">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button onClick={() => setLeatherHasClasp(false)} className={`py-3 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${!leatherHasClasp ? 'border-gold bg-gold/10 text-gold' : 'border-gold/60 text-ivory/70'}`}>Zár nélkül</button>
                                                                    <button onClick={() => setLeatherHasClasp(true)} className={`py-3 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${leatherHasClasp ? 'border-gold bg-gold/10 text-gold' : 'border-gold/60 text-ivory/70'}`}>Ezüst zárral (+8.000 Ft)</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <button onClick={() => setAccessoryType('chain')} className={`py-4 px-6 border rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex justify-between items-center ${accessoryType === 'chain' ? 'border-gold bg-gold/5 text-gold shadow-lg shadow-gold/10' : 'border-gold/60 text-ivory/70'}`}>
                                                            <span>{t('accessory_chain')}</span>
                                                            <span className="opacity-70">{t('accessory_length')}</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {(isKolie || accessoryType === 'chain' || (accessoryType === 'leather' && leatherHasClasp)) && (
                                                <div className="pt-4 space-y-4">
                                                     {!isKolie && accessoryType === 'chain' && isMedalCategory && (
                                                        <div className="mb-10 space-y-4">
                                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">Lánc Típusa</label>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="relative">
                                                                    <button onClick={() => setChainType('anker')} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${chainType === 'anker' ? 'border-gold bg-gold/10 text-gold shadow-lg' : 'border-gold/10 text-ivory/40'}`}>Anker</button>
                                                                    <button onClick={(e) => { e.preventDefault(); setPreviewModal({ isOpen: true, src: imageSettings.anker_chain, title: 'Anker típusú lánc' }); }} className="absolute -top-2 -right-2 bg-[#150e03] border border-gold/40 p-2 rounded-full text-gold group-hover:scale-110 shadow-xl z-10"><Eye className="h-3.5 w-3.5" /></button>
                                                                </div>
                                                                <div className="relative">
                                                                    <button onClick={() => setChainType('barbara')} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${chainType === 'barbara' ? 'border-gold bg-gold/10 text-gold shadow-lg' : 'border-gold/10 text-ivory/40'}`}>Barbara</button>
                                                                    <button onClick={(e) => { e.preventDefault(); setPreviewModal({ isOpen: true, src: imageSettings.barbara_chain, title: 'Barbara típusú lánc' }); }} className="absolute -top-2 -right-2 bg-[#150e03] border border-gold/40 p-2 rounded-full text-gold group-hover:scale-110 shadow-xl z-10"><Eye className="h-3.5 w-3.5" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('accessory_length')}</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['40', '42', '45', '50', '55'].map((len) => (
                                                            <button key={len} onClick={() => { setChainLength(len as any); if (accessoryType === 'leather') setUseCustomLeather(false); }} className={`py-3 px-4 rounded-lg text-[10px] font-black transition-all border relative flex-1 min-w-[18%] ${(!useCustomLeather && chainLength === len) ? 'border-gold bg-gold text-deep-brown shadow-lg' : 'border-gold/10 text-ivory/40'}`}>
                                                                {len} cm
                                                                {!isKolie && (accessoryType === 'chain' || (accessoryType === 'leather' && leatherHasClasp)) && (
                                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-gold font-bold whitespace-nowrap opacity-60">
                                                                        +{formatPrice(accessoryType === 'leather' ? 8000 : (currentChainPrices[len] || 0))}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                        {accessoryType === 'leather' && leatherHasClasp && (
                                                            <button onClick={() => setUseCustomLeather(true)} className={`py-3 px-4 rounded-lg text-[10px] font-black transition-all border flex-1 min-w-[18%] ${useCustomLeather ? 'border-gold bg-gold text-deep-brown shadow-lg' : 'border-gold/10 text-ivory/40'}`}>Egyéb</button>
                                                        )}
                                                    </div>
                                                    {accessoryType === 'leather' && leatherHasClasp && useCustomLeather && (
                                                        <input type="text" value={customLeatherValue} onChange={(e) => setCustomLeatherValue(e.target.value)} placeholder="Írja be a kívánt méretet (pl. 47 cm)" className="w-full bg-black/40 border border-gold/20 p-4 rounded-xl text-xs outline-none focus:border-gold text-ivory transition-all placeholder:text-ivory/20 shadow-inner" autoFocus />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Enamel Selection */}
                                    {product.isEnamel && (
                                        <div className="space-y-4">
                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('enamel_title')} ({product.enamelRequiredCount === 2 ? 'Kérjük, válassz 2 színt' : 'Kérjük, válassz 1 színt'})</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {(globalEnamelColors || []).map((color) => {
                                                    const isSelected = selectedEnamelColors.includes(color);
                                                    return (
                                                        <button key={color} onClick={() => { if (isSelected) { setSelectedEnamelColors(prev => prev.filter(c => c !== color)); } else { const max = product.enamelRequiredCount || 1; if (max === 1) { setSelectedEnamelColors([color]); } else if (selectedEnamelColors.length < max) { setSelectedEnamelColors(prev => [...prev, color]); } } }} className={`px-4 py-3 rounded-xl text-[10px] uppercase font-black border transition-all ${isSelected ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/30 text-gold/80 bg-gold/5 hover:border-gold/50'}`}>{color}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stone Selection */}
                                    {isKoves && (
                                        <div className="space-y-4">
                                            <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('stone_selection')}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {stoneOptions.map((stoneKey) => {
                                                    const price = stonePrices[stoneKey] || 0;
                                                    return (
                                                        <button key={stoneKey} onClick={() => setSelectedStone(stoneKey)} className={`px-4 py-3 rounded-xl text-[10px] uppercase font-black border transition-all flex flex-col items-center gap-1 min-w-[80px] ${selectedStone === stoneKey ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/30 text-gold/80 bg-gold/5 hover:border-gold/50'}`}>
                                                            <span>{t(stoneKey)}</span>
                                                            <span className="text-[8px] opacity-60 font-medium whitespace-nowrap">{price > 0 ? `+${formatPrice(price)}` : '0 Ft'}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Gold Engagement Ring Options */}
                                    {product.isGoldEngagementRing && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('gold_color')}</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {['gold_white', 'gold_yellow', 'gold_rose'].map((color) => (
                                                        <button key={color} onClick={() => setGoldColor(color)} className={`py-3 text-[10px] uppercase font-black transition-all border rounded-lg ${goldColor === color ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{t(color)}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="flex items-center text-[10px] uppercase tracking-[0.4em] font-black text-gold">{t('lab_diamond_size')}</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['0.25ct', '0.50ct', '0.75ct', '1.0ct', '1.5ct', '2.0ct'].map((size) => (
                                                        <button key={size} onClick={() => setLabDiamondSize(size)} className={`py-3 px-4 text-[10px] uppercase font-black transition-all border rounded-lg flex-1 min-w-[25%] ${labDiamondSize === size ? 'bg-gold border-gold text-deep-brown shadow-lg' : 'border-gold/20 text-gold/60'}`}>{size}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(product.isGoldOnly || product.isGoldEngagementRing) ? (
                                    <div className="py-8 border-y border-gold/10">
                                        <p className="text-lg md:text-2xl font-black text-gold tracking-wider md:tracking-widest uppercase leading-snug">{t('quote_only')}</p>
                                    </div>
                                ) : (
                                    <div className="py-8 border-y border-gold/10">
                                        <div className="flex items-baseline gap-4">
                                            <p className="text-3xl md:text-4xl font-black text-gold tracking-tighter">{formatPrice(displayPrice)}</p>
                                            <span className="text-ivory/20 text-[10px] font-bold uppercase tracking-[0.3em]">HUF</span>
                                        </div>
                                        {isKolie && <p className="text-[9px] text-gold/60 uppercase font-black tracking-widest mt-2 bg-gold/5 py-1 px-3 rounded inline-block">Lánccal együtt</p>}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {validationError && <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-center">{validationError}</div>}
                                    {product.isGoldEngagementRing && (
                                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-300/90 text-[10px] uppercase tracking-widest font-bold text-center leading-relaxed">
                                            ⏳ A Lab Diamond kő szállítása <span className="text-amber-300 font-black">~3 hetet</span> vesz igénybe,<br/>
                                            ezért a gyűrű várható elkészülési ideje <span className="text-amber-300 font-black">4–5 hét.</span>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-xl border text-center text-[10px] uppercase tracking-widest font-bold ${vacationMode?.isActive ? 'bg-red-900/10 border-red-500/20 text-red-500/80' : 'bg-gold/5 border-gold/10 text-gold/70'}`}>
                                        {vacationMode?.isActive ? (
                                            <>Szabadságon vagyunk. A megrendelések elkészítését leghamarabb <br/><span className="text-red-400 font-black">{vacationMode.returnDate} napon</span> tudjuk elkezdeni.</>
                                        ) : (
                                            <>A megrendelt ékszereket egyedileg készítjük el, <br/><span className="text-gold font-black">10 munkanapon</span> belül.</>
                                        )}
                                    </div>
                                    {(product.isGoldOnly || product.isGoldEngagementRing) ? (
                                        <button onClick={() => { if (!validateSelection()) return; setIsGoldModalOpen(true); }} className="w-full py-6 bg-gold text-deep-brown rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#b08d55] transition-all flex items-center justify-center shadow-xl">{t('quote_request_button')}</button>
                                    ) : (
                                        <>
                                            <button onClick={() => { if (!validateSelection()) return; addToCart({ ...product, price: displayPrice }, getFinalCustomization()); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000); }} disabled={isAdded} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${isAdded ? "bg-gold text-deep-brown" : "bg-ivory text-deep-brown hover:bg-gold shadow-xl"}`}><ShoppingCart className="h-5 w-5" />{isAdded ? t('added') : t('add_to_cart')}</button>
                                            <button onClick={() => { if (!validateSelection()) return; setIsGoldModalOpen(true); }} className="w-full py-5 border border-gold/30 text-gold rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-gold/5 transition-all flex items-center justify-center shadow-lg">{t('order_gold')}</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="lg:col-span-7 order-3 lg:mt-16">
                        {(displayHistory || displayDescription) && (
                            <div className="pt-8 border-t border-gold/10">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xs uppercase tracking-[0.4em] font-black text-gold">{t('history_title')}</h3>
                                        <div className="h-[1px] flex-1 bg-gold/10"></div>
                                    </div>
                                    <div className="text-ivory/95 leading-relaxed text-base font-serif bg-white/[0.02] p-10 rounded-[2rem] border border-white/[0.05] shadow-inner text-justify">
                                        {displayHistory || displayDescription || "Nincs elérhető történelmi háttér."}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collection */}
                    <div className="lg:col-span-7 order-4 lg:mt-8">
                        {activeCollectionProducts.length > 0 && (
                            <div className="pt-8 border-t border-gold/10">
                                <div className="flex flex-col mb-12 space-y-4">
                                    <span className="text-gold text-xs font-bold uppercase tracking-[0.4em]">
                                        {collection ? collection.name : t('collection_title')}
                                    </span>
                                    <p className="text-[10px] text-ivory/60 uppercase tracking-[0.2em] font-bold leading-relaxed bg-gold/5 p-4 rounded-xl border border-gold/10">
                                        Tedd teljessé a szettet! Vásárolj a kollekcióból <br />
                                        <span className="text-gold font-black">2 darabot 5% kedvezménnyel</span>, vagy <span className="text-gold font-black border-b border-gold/50">3 darabot 10% kedvezménnyel</span>!
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                                    {activeCollectionProducts.map((p) => (
                                        <Link key={p.id} href={`/product/${p.id}`} className="group block bg-black/20 p-4 rounded-2xl border border-gold/5 hover:border-gold/20 transition-all shadow-md">
                                            <div className="relative aspect-square overflow-hidden rounded-xl mb-6 shadow-lg">
                                                <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                                            </div>
                                            <h4 className="text-[11px] uppercase tracking-[0.2em] font-serif italic text-ivory/90 group-hover:text-gold transition-colors truncate mb-2">{p.name}</h4>
                                            <div className="flex items-center justify-between border-t border-gold/10 pt-3">
                                                <p className="text-xs font-black text-gold">{formatPrice(p.price)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isGoldModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGoldModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-lg bg-[#1a1205] border border-gold/30 p-12 rounded-[3rem] text-center space-y-10">
                            <h2 className="text-3xl font-serif text-ivory uppercase tracking-[0.2em]">{t('order_gold')}</h2>
                            <div className="space-y-8 text-left">
                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase tracking-[0.4em] font-black text-gold/60">{t('full_name')}</label>
                                    <input type="text" className="w-full bg-black/40 border border-gold/20 p-5 rounded-2xl text-[12px] outline-none focus:border-gold text-ivory" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={t('full_name_placeholder')} />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase tracking-[0.4em] font-black text-gold/60">E-mail Cím</label>
                                    <input type="email" className="w-full bg-black/40 border border-gold/20 p-5 rounded-2xl text-[12px] outline-none focus:border-gold text-ivory" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="pelda@email.hu" />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase tracking-[0.4em] font-black text-gold/60">{t('message_label')}</label>
                                    <div className="bg-black/40 border border-gold/20 p-6 rounded-2xl text-[12px] text-ivory/50 leading-relaxed italic font-serif h-56 overflow-y-auto custom-scrollbar">
                                        <p>{t('gold_template_intro')}</p>
                                        <p className="mt-4">{t('gold_template_body')}</p>
                                        <div className="mt-6 border-l-2 border-gold/40 pl-6 py-4 space-y-2 bg-gold/5 rounded-r-xl">
                                            <p className="font-sans not-italic text-sm uppercase tracking-widest text-ivory font-black">{displayName}</p>
                                            <p className="font-sans not-italic text-[10px] uppercase tracking-[0.3em] text-gold">{t('sku')}: {product.sku}</p>
                                            <p className="font-sans not-italic text-[10px] uppercase tracking-[0.3em] text-ivory/60">{t('size')}: {getFinalCustomization() || t('standard_size')}</p>
                                        </div>
                                        <p className="mt-8">{t('gold_template_outro')}</p>
                                        <p className="mt-6">{t('best_regards')}</p>
                                        <p className="text-gold font-sans not-italic font-black mt-2">{userName || '...'}</p>
                                    </div>
                                </div>
                            </div>
                            {goldModalError && <p className="text-red-500 font-bold text-sm">{goldModalError}</p>}
                            <button onClick={handleGoldRequest} className="w-full bg-gold text-deep-brown py-6 rounded-2xl font-black tracking-[0.6em] uppercase text-[11px] shadow-2xl">{t('send_request')}</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isImageModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm cursor-zoom-out" onClick={() => setIsImageModalOpen(false)}>
                        <button className="absolute top-6 right-6 p-4 bg-gold/10 hover:bg-gold/30 text-ivory rounded-full transition-all z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}>
                            <X className="h-6 w-6 text-ivory" />
                        </button>
                        
                        {allImages.length > 1 && (
                            <>
                                <button 
                                    className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-3 md:p-5 bg-black/60 hover:bg-gold/40 text-ivory rounded-full transition-all z-20 cursor-pointer backdrop-blur-md border border-ivory/10" 
                                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1); }}
                                >
                                    <ChevronLeft className="h-6 w-6 md:h-10 md:w-10 text-ivory" />
                                </button>
                                <button 
                                    className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-3 md:p-5 bg-black/60 hover:bg-gold/40 text-ivory rounded-full transition-all z-20 cursor-pointer backdrop-blur-md border border-ivory/10" 
                                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1); }}
                                >
                                    <ChevronRight className="h-6 w-6 md:h-10 md:w-10 text-ivory" />
                                </button>
                            </>
                        )}
                        
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl h-[60vh] md:h-[90vh] rounded-2xl overflow-hidden cursor-default shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <Image src={currentImage} alt={displayName} fill className="object-contain" priority unoptimized />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <ImagePreviewModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))} imageSrc={previewModal.src} title={previewModal.title} />
        </main>
    );
}
