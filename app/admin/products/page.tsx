"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { Product } from '@/lib/data';
import { 
    Search, 
    Filter, 
    RotateCcw, 
    Edit2, 
    Trash2, 
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Plus,
    X,
    TrendingUp,
    AlertCircle,
    Save,
    Upload,
    Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { AdminImageUpload } from '@/components/admin/AdminImageUpload';
import { AdminMultipleImageUpload } from '@/components/admin/AdminMultipleImageUpload';

function AdminProductsContent() {
    const { products, setProducts, t, formatPrice, saveProduct, deleteProduct, translations, updateTranslation, collections, saveCollection, deleteCollection, customJewelry, updateCustomJewelry } = useConfig();
    const [activeTab, setActiveTab] = useState<'products' | 'pages' | 'collections' | 'gallery'>('products');
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    // Pagination removed per user request - showing all products in a single list
    
    // UI States
    const [showPricingTool, setShowPricingTool] = useState(false);
    const [pricePercentage, setPricePercentage] = useState('');
    const [priceConfirm, setPriceConfirm] = useState(false);
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [enamelColorsInput, setEnamelColorsInput] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [pricingCategory, setPricingCategory] = useState('all');
    const [managingCollectionId, setManagingCollectionId] = useState<string | null>(null);
    const [collectionSearchTerm, setCollectionSearchTerm] = useState('');
    const [isEnamelOnly, setIsEnamelOnly] = useState(false);
    const [isUploadingBulk, setIsUploadingBulk] = useState<string | null>(null); // Category ID being uploaded to


    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'collections' || tab === 'pages' || tab === 'products' || tab === 'gallery') {
            setActiveTab(tab as any);
        }
        
        if (searchParams.get('tool') === 'pricing') {
            setShowPricingTool(true);
        }
    }, [searchParams]);

    const categories = [
        { slug: 'all', name: 'Minden kategória' },
        { slug: 'medalok-es-talizmanok', name: 'Medálok' },
        { slug: 'noi-lancok', name: 'Láncok' },
        { slug: 'fulbevalok', name: 'Fülbevalók' },
        { slug: 'karkotok', name: 'Karkötők' },
        { slug: 'karperecek', name: 'Karperecek' },
        { slug: 'gyuruk', name: 'Gyűrűk' },
        { slug: 'eljegyzesi-es-karikagyuruk', name: 'Karikagyűrűk' },
        { slug: 'eljegyzesi-gyuruk', name: 'Eljegyzési gyűrűk' },
        { slug: 'szobrok-es-disztargyak', name: 'Szobrok' },
        { slug: 'modern-ekszerek', name: 'Modern' }
    ];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesEnamel = !isEnamelOnly || p.isEnamel === true;
        return matchesSearch && matchesCategory && matchesEnamel;
    });

    const currentProducts = filteredProducts;

    // Bulk Price Adjustment
    const handleBulkPriceAdjustment = () => {
        const factor = 1 + (parseFloat(pricePercentage) / 100);
        if (isNaN(factor)) return;

        const updatedProducts = products.map(p => {
            if (pricingCategory === 'all' || p.category === pricingCategory) {
                return { ...p, price: Math.round(p.price * factor) };
            }
            return p;
        });

        setProducts(updatedProducts);
        setPricePercentage('');
        setPriceConfirm(false);
        setShowPricingTool(false);
    };

    // Modal Handlers
    const openEditModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setEnamelColorsInput(product.enamelColors?.join(', ') || '');
        } else {
            setEditingProduct({
                id: `prod_${Date.now()}`,
                name: '',
                description: '',
                price: 0,
                category: categoryFilter === 'all' ? 'medalok-es-talizmanok' : categoryFilter,
                image: '',
                sku: '',
                weight: '',
                history: '',
                isKolie: false,
                allowsStone: false
            });
            setEnamelColorsInput('');
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            const colors = enamelColorsInput.split(',').map(s => s.trim()).filter(Boolean);
            saveProduct({ ...editingProduct, enamelColors: colors });
            setIsModalOpen(false);
            setEditingProduct(null);
            setEnamelColorsInput('');
        }
    };

    const handleDelete = (id: string) => {
        deleteProduct(id);
        setIsDeleting(null);
    };

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <div className="flex border-b border-gold/10 gap-8">
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`pb-4 text-xs uppercase tracking-[0.4em] font-black transition-all border-b-2 ${
                        activeTab === 'products' ? 'text-gold border-gold' : 'text-ivory/20 border-transparent hover:text-ivory/40'
                    }`}
                >
                    Termékek Kezelése
                </button>
                <button 
                    onClick={() => setActiveTab('collections')}
                    className={`pb-4 text-xs uppercase tracking-[0.4em] font-black transition-all border-b-2 ${
                        activeTab === 'collections' ? 'text-gold border-gold' : 'text-ivory/20 border-transparent hover:text-ivory/40'
                    }`}
                >
                    Kollekciók
                </button>
                <button 
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-4 text-xs uppercase tracking-[0.4em] font-black transition-all border-b-2 ${
                        activeTab === 'gallery' ? 'text-gold border-gold' : 'text-ivory/20 border-transparent hover:text-ivory/40'
                    }`}
                >
                    Galéria (Egyedi)
                </button>
                <button 
                    onClick={() => setActiveTab('pages')}
                    className={`pb-4 text-xs uppercase tracking-[0.4em] font-black transition-all border-b-2 ${
                        activeTab === 'pages' ? 'text-gold border-gold' : 'text-ivory/20 border-transparent hover:text-ivory/40'
                    }`}
                >
                    Oldalak
                </button>
            </div>

            {activeTab === 'products' && (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gold/10">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif text-ivory tracking-widest uppercase">Ékszertár Kezelés</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-gold/60 text-xs uppercase tracking-[0.4em] font-black">
                                    {filteredProducts.length} Kincs a rendszerben
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => setShowPricingTool(!showPricingTool)}
                                className={`px-8 py-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                                    showPricingTool ? 'bg-gold text-deep-brown shadow-gold/20' : 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20'
                                }`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                Árkezelés
                            </button>
                            <button 
                                onClick={() => openEditModal()}
                                className="bg-ivory text-deep-brown px-8 py-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gold transition-all shadow-xl active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                Új ékszer
                            </button>
                        </div>
                    </div>

                    {/* Pricing Tool Overlay */}
                    <AnimatePresence>
                        {showPricingTool && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gold/5 border border-gold/20 p-8 rounded-lg space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-gold">Tömeges áremelés / csökkentés</h3>
                                        <button onClick={() => setShowPricingTool(false)} className="text-gold/40 hover:text-gold">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                        <div className="space-y-3">
                                            <label className="text-[11px] uppercase tracking-[0.2em] font-black text-ivory/40">Kiválasztott kategória</label>
                                            <select 
                                                value={pricingCategory}
                                                onChange={(e) => setPricingCategory(e.target.value)}
                                                className="w-full bg-deep-brown border border-gold/10 p-3 text-sm text-ivory outline-none focus:border-gold/40 uppercase font-black"
                                            >
                                                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] uppercase tracking-[0.2em] font-black text-ivory/40">Mérték (%)</label>
                                            <input 
                                                type="number"
                                                placeholder="+10 vagy -5"
                                                value={pricePercentage}
                                                onChange={(e) => setPricePercentage(e.target.value)}
                                                className="w-full bg-deep-brown border border-gold/10 p-3 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-4">
                                            {priceConfirm ? (
                                                <div className="flex items-center gap-4 w-full">
                                                    <button 
                                                        onClick={handleBulkPriceAdjustment}
                                                        className="flex-1 bg-gold text-deep-brown py-3 rounded-md text-xs font-black uppercase tracking-widest"
                                                    >
                                                        Megerősítem az árazást
                                                    </button>
                                                    <button onClick={() => setPriceConfirm(false)} className="px-6 py-3 border border-gold/20 text-gold text-xs uppercase font-black tracking-widest">Mégse</button>
                                                </div>
                                            ) : (
                                                <button 
                                                    disabled={!pricePercentage}
                                                    onClick={() => setPriceConfirm(true)}
                                                    className="w-full bg-gold/20 text-gold py-3 rounded-md text-xs font-black uppercase tracking-widest hover:bg-gold/30 disabled:opacity-20"
                                                >
                                                    Árazás indítása
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-6 items-center">
                        <div className="relative group">
                            <Search className="absolute left-4 top-3 h-4 w-4 text-gold/30 group-focus-within:text-gold transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Név vagy azonosító (SKU)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/40 border border-gold/10 rounded-md py-3 pl-12 pr-6 text-sm text-ivory outline-none focus:border-gold/30 w-80 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="h-4 w-4 text-gold/30" />
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button 
                                        key={cat.slug} 
                                        onClick={() => setCategoryFilter(cat.slug)}
                                        className={`px-4 py-2 rounded-full text-[11px] uppercase font-black tracking-widest transition-all ${
                                            categoryFilter === cat.slug ? 'bg-gold text-deep-brown' : 'bg-gold/5 text-gold/60 hover:bg-gold/10'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-gold/10 hidden md:block mx-2"></div>
                        <button 
                            onClick={() => setIsEnamelOnly(!isEnamelOnly)}
                            className={`px-6 py-2 rounded-full text-[11px] uppercase font-black tracking-widest transition-all flex items-center gap-2 ${
                                isEnamelOnly ? 'bg-gold text-deep-brown shadow-[0_0_15px_rgba(201,165,106,0.3)]' : 'bg-gold/5 text-gold/60 border border-gold/10 hover:border-gold/30'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isEnamelOnly ? 'bg-deep-brown animate-pulse' : 'bg-gold/30'}`}></span>
                            Zománcos termékek
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-black/20 border border-gold/5 rounded-xl overflow-hidden backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gold/5 text-[11px] uppercase tracking-[0.2em] font-black text-ivory/40">
                                <tr>
                                    <th className="px-8 py-6">Ékszer</th>
                                    <th className="px-8 py-6">Kategória</th>
                                    <th className="px-8 py-6">Alapár</th>
                                    <th className="px-8 py-6 text-right">Műveletek</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                                {currentProducts.map(p => (
                                    <tr key={p.id} className="group hover:bg-gold/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-12 bg-deep-brown border border-gold/10 relative overflow-hidden flex-shrink-0 rounded">
                                                    <Image src={p.image} alt={p.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-base font-serif text-ivory group-hover:text-gold transition-colors">{p.name}</div>
                                                    <div className="text-[11px] text-gold/40 font-black uppercase tracking-widest flex items-center gap-3">
                                                        <span>{p.sku || 'Nincs SKU'}</span>
                                                        {p.isKolie && <span className="text-[7px] bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase">Kolié</span>}
                                                        {p.isEnamel && <span className="text-[7px] bg-gold text-deep-brown px-1.5 py-0.5 rounded uppercase font-black">Zománc</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs text-ivory/60 uppercase tracking-widest">{t(`cat_${p.category}`)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-base font-bold text-gold">{formatPrice(p.price)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openEditModal(p)} className="p-3 bg-ivory/5 text-ivory/40 hover:bg-gold/20 hover:text-gold rounded transition-all">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setIsDeleting(p.id)} className="p-3 bg-red-500/5 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 rounded transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <Link href={`/product/${p.id}`} className="p-3 bg-ivory/5 text-ivory/40 hover:bg-gold/20 hover:text-gold rounded transition-all">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>



                    {/* PRODUCT EDITOR MODAL */}
                    <AnimatePresence>
                        {isModalOpen && editingProduct && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-[#150e03] border border-gold/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-3xl"
                                >
                                    <div className="p-8 border-b border-gold/10 flex justify-between items-center bg-gold/5">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-serif text-ivory tracking-[0.2em] uppercase">
                                                {editingProduct.id.includes('prod_') && editingProduct.name === '' ? 'Új ékszer rögzítése' : 'Adatlap módosítása'}
                                            </h2>
                                            <p className="text-gold/60 text-[11px] uppercase tracking-widest font-black">Adja meg az ékszer paramétereit</p>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="bg-ivory/5 p-4 rounded-full text-ivory/40 hover:text-ivory">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form id="productForm" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Left: Basic Info */}
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Megnevezés</label>
                                                    <input 
                                                        required
                                                        type="text" 
                                                        value={editingProduct.name}
                                                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                                        placeholder="Pl: Szkíta lovas ékszer"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Ár (Ft)</label>
                                                        <input 
                                                            type="number" 
                                                            value={editingProduct.price}
                                                            onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                                                            className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Cikkszám (SKU)</label>
                                                        <input 
                                                            type="text" 
                                                            value={editingProduct.sku}
                                                            onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                                                            className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                                            placeholder="ME-001"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Kollekció</label>
                                                    <select 
                                                        value={editingProduct.collectionId || ''}
                                                        onChange={(e) => setEditingProduct({...editingProduct, collectionId: e.target.value || undefined})}
                                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40 uppercase tracking-widest font-black"
                                                    >
                                                        <option value="">Nincs kollekcióhoz rendelve</option>
                                                        {collections.map(col => (
                                                            <option key={col.id} value={col.id}>{col.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Kategória</label>
                                                    <select 
                                                        value={editingProduct.category || ''}
                                                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40 uppercase tracking-widest font-black"
                                                    >
                                                        {categories.filter(c => c.slug !== 'all').map(cat => (
                                                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Right: Visuals & Spec */}
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <AdminImageUpload 
                                                        label="Kép (Fő)"
                                                        value={editingProduct.image}
                                                        onChange={(val) => setEditingProduct({...editingProduct, image: val})}
                                                        helperText="URL vagy közvetlen feltöltés"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <AdminMultipleImageUpload 
                                                        label="További Képek (Galéria)"
                                                        images={editingProduct.additionalImages || []}
                                                        onChange={(images) => setEditingProduct({...editingProduct, additionalImages: images})}
                                                        helperText="Több kép kiválasztása engedélyezett"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Súly (Pl: 12g)</label>
                                                    <div className="flex gap-4">
                                                        <input 
                                                            type="text" 
                                                            value={editingProduct.weight}
                                                            onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                                                            className="flex-1 bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                                            placeholder="12g"
                                                        />
                                                        <div className="bg-[#0d0902] border border-gold/10 p-5 text-xs text-gold/60 font-black uppercase tracking-widest flex items-center">
                                                            Ezüst 925
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Kolié Toggle */}
                                                {(editingProduct.category === 'noi-lancok' || editingProduct.category === 'medalok-es-talizmanok') && (
                                                    <div className="flex items-center gap-4 bg-gold/5 p-6 border border-gold/10 rounded-md">
                                                        <input 
                                                            type="checkbox" 
                                                            id="isKolie"
                                                            checked={editingProduct.isKolie || false}
                                                            onChange={(e) => setEditingProduct({...editingProduct, isKolie: e.target.checked})}
                                                            className="w-5 h-5 accent-gold cursor-pointer"
                                                        />
                                                        <div className="space-y-1">
                                                            <label htmlFor="isKolie" className="text-xs uppercase tracking-[0.2em] font-black text-gold cursor-pointer">Kolié Kivitel</label>
                                                            <p className="text-[10px] text-ivory/40 uppercase tracking-widest leading-relaxed">
                                                                Ha be van kapcsolva, a lánc árát a rendszer belefoglalja az alapárba, <br/>
                                                                de a vásárlónak továbbra is ki kell választania a méretet.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Gold Only and Gold Engagement Ring Toggles */}
                                                <div className="flex flex-col gap-4 bg-gold/5 p-6 border border-gold/10 rounded-md">
                                                    <div className="flex items-center gap-4">
                                                        <input 
                                                            type="checkbox" 
                                                            id="isGoldOnly"
                                                            checked={editingProduct.isGoldOnly || false}
                                                            onChange={(e) => setEditingProduct({...editingProduct, isGoldOnly: e.target.checked})}
                                                            className="w-5 h-5 accent-gold cursor-pointer"
                                                        />
                                                        <div className="space-y-1">
                                                            <label htmlFor="isGoldOnly" className="text-xs uppercase tracking-[0.2em] font-black text-gold cursor-pointer">Csak aranyból rendelhető (ár elrejtése)</label>
                                                            <p className="text-[10px] text-ivory/40 uppercase tracking-widest leading-relaxed">
                                                                Ha be van kapcsolva, az ár helyett "Egyedi árajánlat alapján" jelenik meg,<br/>és a kosár gomb helyett "Ajánlatot kérek" lesz.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <input 
                                                            type="checkbox" 
                                                            id="isGoldEngagementRing"
                                                            checked={editingProduct.isGoldEngagementRing || false}
                                                            onChange={(e) => setEditingProduct({...editingProduct, isGoldEngagementRing: e.target.checked})}
                                                            className="w-5 h-5 accent-gold cursor-pointer"
                                                        />
                                                        <div className="space-y-1">
                                                            <label htmlFor="isGoldEngagementRing" className="text-xs uppercase tracking-[0.2em] font-black text-gold cursor-pointer">Arany eljegyzési gyűrű specifikus opciók</label>
                                                            <p className="text-[10px] text-ivory/40 uppercase tracking-widest leading-relaxed">
                                                                Ha be van kapcsolva, a termékoldalon megjelennek a gyűrűméret, Lab Diamond méret és arany szín opciók. <br/>(Automatikusan "Egyedi árajánlat" módot aktivál).
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 bg-gold/5 p-6 border border-gold/10 rounded-md">
                                                    <input 
                                                        type="checkbox" 
                                                        id="allowsStone"
                                                        checked={editingProduct.allowsStone || false}
                                                        onChange={(e) => setEditingProduct({...editingProduct, allowsStone: e.target.checked})}
                                                        className="w-5 h-5 accent-gold cursor-pointer"
                                                    />
                                                    <div className="space-y-1">
                                                        <label htmlFor="allowsStone" className="text-xs uppercase tracking-[0.2em] font-black text-gold cursor-pointer">Választható Kövek</label>
                                                        <p className="text-[10px] text-ivory/40 uppercase tracking-widest leading-relaxed">
                                                            Ha be van kapcsolva, a vásárló kérhet bele követ (Sólyomszem, Gránát, stb.) <br/>
                                                            felár ellenében (+3 000 Ft).
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Enamel Toggle */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 bg-gold/5 p-6 border border-gold/10 rounded-md">
                                                        <input 
                                                            type="checkbox" 
                                                            id="isEnamel"
                                                            checked={editingProduct.isEnamel || false}
                                                            onChange={(e) => setEditingProduct({
                                                                ...editingProduct, 
                                                                isEnamel: e.target.checked,
                                                                enamelRequiredCount: editingProduct.enamelRequiredCount || 1
                                                            })}
                                                            className="w-5 h-5 accent-gold cursor-pointer"
                                                        />
                                                        <div className="space-y-1">
                                                            <label htmlFor="isEnamel" className="text-xs uppercase tracking-[0.2em] font-black text-gold cursor-pointer">Zománcos Kivitel</label>
                                                            <p className="text-[10px] text-ivory/40 uppercase tracking-widest leading-relaxed">
                                                                Ha be van kapcsolva, a vásárlónak zománc színeket kell választania.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {editingProduct.isEnamel && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            className="space-y-6 pt-2 pl-4 border-l-2 border-gold/20"
                                                        >
                                                            <div className="space-y-3">
                                                                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-gold/60">{t('enamel_colors_label')}</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={enamelColorsInput}
                                                                    onChange={(e) => setEnamelColorsInput(e.target.value)}
                                                                    className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40"
                                                                    placeholder="Pl: Kék, Piros, Türkiz, Fekete"
                                                                />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-gold/60">{t('enamel_selection_mode')}</label>
                                                                <div className="flex gap-4">
                                                                    {[1, 2].map(count => (
                                                                        <button
                                                                            key={count}
                                                                            type="button"
                                                                            onClick={() => setEditingProduct({...editingProduct, enamelRequiredCount: count as 1 | 2})}
                                                                            className={`px-4 py-2 border rounded text-[11px] uppercase font-black tracking-widest transition-all ${
                                                                                editingProduct.enamelRequiredCount === count 
                                                                                ? 'bg-gold border-gold text-deep-brown' 
                                                                                : 'border-gold/10 text-gold/40 hover:border-gold/30'
                                                                            }`}
                                                                        >
                                                                            {count} szín
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className="flex bg-black/40 border border-gold/10 rounded-md p-6 gap-6 items-center">
                                                    <div className="h-20 w-16 bg-[#111] border border-gold/10 relative overflow-hidden flex items-center justify-center">
                                                        {editingProduct.image ? (
                                                            <img src={editingProduct.image} className="object-cover w-full h-full opacity-50" alt="Preview"/>
                                                        ) : (
                                                            <ImageIcon className="h-6 w-6 text-ivory/10" />
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-[#666666] uppercase leading-relaxed tracking-wider">
                                                        <p className="text-gold mb-1 font-black">Látványterv előnézet</p>
                                                        <p>Győződjön meg róla, hogy a kép elérhető ezen az útvonalon.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-10 border-t border-gold/10 pt-10">
                                            <div className="space-y-3">
                                                <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Eredete és Története (Közönségnek)</label>
                                                <textarea 
                                                    rows={8}
                                                    value={editingProduct.history}
                                                    onChange={(e) => setEditingProduct({...editingProduct, history: e.target.value})}
                                                    className="w-full bg-[#0d0902] border border-gold/10 p-6 text-base text-ivory outline-none focus:border-gold/40 italic font-serif leading-loose resize-y min-h-[200px]"
                                                    placeholder="A motívum eredeti leírása, történelmi háttere..."
                                                />
                                            </div>
                                        </div>

                                        {/* ENGLISH TRANSLATIONS */}
                                        <div className="space-y-10 border-t border-gold/10 pt-10">
                                            <div className="space-y-1">
                                                <h3 className="text-base font-serif text-ivory tracking-[0.2em] uppercase text-gold">Angol nyelvű adatok (EN)</h3>
                                                <p className="text-ivory/40 text-[11px] uppercase tracking-widest leading-relaxed">Ha az alábbi mezők ki vannak töltve, az oldal angol nyelven ezeket fogja megjeleníteni.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Megnevezés (Angolul)</label>
                                                <input 
                                                    type="text" 
                                                    value={editingProduct.nameEn || ''}
                                                    onChange={(e) => setEditingProduct({...editingProduct, nameEn: e.target.value})}
                                                    className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                                    placeholder="Pl: Scythian horse jewelry"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Rövid Leírás (Angolul)</label>
                                                <textarea 
                                                    rows={3}
                                                    value={editingProduct.descriptionEn || ''}
                                                    onChange={(e) => setEditingProduct({...editingProduct, descriptionEn: e.target.value})}
                                                    className="w-full bg-[#0d0902] border border-gold/10 p-6 text-base text-ivory outline-none focus:border-gold/40 resize-y"
                                                    placeholder="English description..."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Eredete és Története (Angolul)</label>
                                                <textarea 
                                                    rows={8}
                                                    value={editingProduct.historyEn || ''}
                                                    onChange={(e) => setEditingProduct({...editingProduct, historyEn: e.target.value})}
                                                    className="w-full bg-[#0d0902] border border-gold/10 p-6 text-base text-ivory outline-none focus:border-gold/40 italic font-serif leading-loose resize-y min-h-[200px]"
                                                    placeholder="English history..."
                                                />
                                            </div>
                                        </div>
                                    </form>

                                    <div className="p-8 border-t border-gold/10 flex justify-end gap-6 bg-gold/5">
                                        <button 
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-10 py-4 text-xs uppercase tracking-widest font-black text-ivory/40 hover:text-ivory"
                                        >
                                            Elvetés
                                        </button>
                                        <button 
                                            type="submit"
                                            form="productForm"
                                            className="bg-gold text-deep-brown px-12 py-4 rounded-md text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] shadow-xl flex items-center gap-3"
                                        >
                                            <Save className="h-4 w-4" />
                                            Adatok Mentése
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* DELETE CONFIRMATION */}
                    <AnimatePresence>
                        {isDeleting && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-[#1e1405] border border-red-500/20 p-12 max-w-md w-full text-center space-y-10"
                                >
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <Trash2 className="h-8 w-8 text-red-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-serif text-ivory uppercase tracking-[0.2em]">Ékszer Törlése</h3>
                                        <p className="text-sm text-ivory/60 leading-relaxed">Biztosan el kívánja távolítani ezt az ékszert a gyűjteményből? Ez a művelet nem vonható vissza.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <button 
                                            onClick={() => setIsDeleting(null)}
                                            className="py-4 border border-ivory/10 text-ivory/40 uppercase text-xs font-black tracking-widest hover:bg-ivory/5"
                                        >
                                            Mégse
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(isDeleting)}
                                            className="py-4 bg-red-600 text-ivory uppercase text-xs font-black tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/10"
                                        >
                                            Törlés
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {activeTab === 'collections' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gold/10">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif text-ivory tracking-widest uppercase">Kollekciók Kezelése</h1>
                            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] font-black">
                                Hozzon létre csoportokat az ékszerekhez (pl. "Szkíta sorozat")
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                const name = prompt('Új kollekció neve:');
                                if (name) saveCollection({ id: `col_${Date.now()}`, name });
                            }}
                            className="bg-ivory text-deep-brown px-8 py-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gold transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Új kollekció
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {collections.length === 0 && (
                            <div className="lg:col-span-3 py-20 text-center border-2 border-dashed border-gold/10 rounded-3xl">
                                <p className="text-ivory/20 text-sm uppercase tracking-widest font-black">Még nincsenek kollekciók létrehozva.</p>
                            </div>
                        )}
                        {collections.map(col => (
                            <div key={col.id} className="bg-black/20 border border-gold/10 p-8 rounded-2xl flex flex-col justify-between gap-6 group hover:border-gold/30 transition-all">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-serif text-ivory group-hover:text-gold transition-colors">{col.name}</h3>
                                    <p className="text-xs text-ivory/40 uppercase tracking-widest font-bold">
                                        {products.filter(p => p.collectionId === col.id).length} termék
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setManagingCollectionId(col.id)}
                                        className="flex-1 py-3 bg-gold/5 text-gold hover:bg-gold/20 text-[11px] uppercase font-black tracking-widest rounded transition-all"
                                    >
                                        Termékek
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const newName = prompt('Új név:', col.name);
                                            if (newName) saveCollection({ ...col, name: newName });
                                        }}
                                        className="py-3 px-4 bg-ivory/5 text-ivory/40 hover:bg-gold/10 hover:text-gold text-[11px] uppercase font-black tracking-widest rounded transition-all"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Biztosan törli ezt a kollekciót? A termékek megmaradnak, de a hozzárendelés megszűnik.')) {
                                                deleteCollection(col.id);
                                            }
                                        }}
                                        className="p-3 bg-red-500/5 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {managingCollectionId && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-[#150e03] border border-gold/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-3xl"
                                >
                                    <div className="p-8 border-b border-gold/10 flex justify-between items-center bg-gold/5">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-serif text-ivory tracking-[0.2em] uppercase">
                                                Kollekció Termékei
                                            </h2>
                                            <p className="text-gold/60 text-[11px] uppercase tracking-widest font-black">Jelölje be, mik tartoznak a kollekcióba</p>
                                        </div>
                                        <button onClick={() => { setManagingCollectionId(null); setCollectionSearchTerm(''); }} className="bg-ivory/5 p-4 rounded-full text-ivory/40 hover:text-ivory">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Collection Search Bar */}
                                    <div className="px-8 py-5 border-b border-gold/10 bg-black/40">
                                        <div className="relative group">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/30 group-focus-within:text-gold transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Keressen az ékszerek között név vagy SKU alapján..."
                                                value={collectionSearchTerm}
                                                onChange={(e) => setCollectionSearchTerm(e.target.value)}
                                                className="w-full bg-[#0d0902] border border-gold/10 focus:border-gold/40 py-4 pl-14 pr-8 text-sm uppercase tracking-widest outline-none text-ivory placeholder-ivory/20 transition-all font-bold rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {products
                                                .filter(p => 
                                                    p.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()) || 
                                                    (p.sku && p.sku.toLowerCase().includes(collectionSearchTerm.toLowerCase()))
                                                )
                                                .map(p => {
                                                const isSelected = p.collectionId === managingCollectionId;
                                                return (
                                                    <label 
                                                        key={p.id}
                                                        className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                                                            isSelected ? 'border-gold bg-gold/10 text-gold' : 'border-gold/10 bg-black/20 text-ivory/60 hover:border-gold/30'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const updated = { ...p, collectionId: e.target.checked ? managingCollectionId : undefined };
                                                                saveProduct(updated);
                                                            }}
                                                            className="w-5 h-5 accent-gold"
                                                        />
                                                        <div className="flex items-center gap-3">
                                                            {p.image && <img src={p.image} className="w-10 h-10 object-cover rounded border border-gold/10" alt="" />}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-serif leading-tight">{p.name}</span>
                                                                <span className="text-[11px] uppercase tracking-widest opacity-60 mt-1">{t(`cat_${p.category}`)}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-gold/10 flex justify-end bg-gold/5">
                                        <button 
                                            onClick={() => { setManagingCollectionId(null); setCollectionSearchTerm(''); }}
                                            className="bg-gold text-deep-brown px-12 py-4 rounded-md text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] shadow-xl"
                                        >
                                            Kész
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === 'pages' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Core Info */}
                        <div className="space-y-10">
                            <h2 className="text-xl font-serif text-ivory uppercase tracking-widest border-b border-gold/10 pb-4">Általános Oldalak</h2>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Nyitvatartás</label>
                                    <textarea 
                                        rows={4}
                                        value={t('page_open_hours_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_open_hours_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Bemutatkozás (About)</label>
                                    <textarea 
                                        rows={8}
                                        value={t('page_about_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_about_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Hitvallás (Mission)</label>
                                    <textarea 
                                        rows={8}
                                        value={t('page_mission_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_mission_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Legal & Contact */}
                        <div className="space-y-10">
                            <h2 className="text-xl font-serif text-ivory uppercase tracking-widest border-b border-gold/10 pb-4">Jogi & Elérhetőség</h2>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Kapcsolat adatok</label>
                                    <textarea 
                                        rows={3}
                                        value={t('page_contact_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_contact_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Szállítási feltételek</label>
                                    <textarea 
                                        rows={4}
                                        value={t('page_shipping_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_shipping_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Rendelési feltételek (Terms)</label>
                                    <textarea 
                                        rows={6}
                                        value={t('page_terms_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_terms_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Adatvédelem (Privacy)</label>
                                    <textarea 
                                        rows={6}
                                        value={t('page_privacy_content')}
                                        onChange={(e) => updateTranslation('HU', 'page_privacy_content', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-5 text-base text-ivory outline-none focus:border-gold/40"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Third Column: Granular Details */}
                        <div className="lg:col-span-2 space-y-10 pt-10 border-t border-gold/10">
                            <h2 className="text-xl font-serif text-ivory uppercase tracking-widest border-b border-gold/10 pb-4">Részletes Elérhetőségek & Bank</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Email 1</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_email_1')}
                                        onChange={(e) => updateTranslation('HU', 'contact_email_1', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Email 2</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_email_2')}
                                        onChange={(e) => updateTranslation('HU', 'contact_email_2', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Telefon 1</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_phone_1')}
                                        onChange={(e) => updateTranslation('HU', 'contact_phone_1', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Telefon 2</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_phone_2')}
                                        onChange={(e) => updateTranslation('HU', 'contact_phone_2', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Cím</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_address')}
                                        onChange={(e) => updateTranslation('HU', 'contact_address', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Céginfó / Helyszín tipp</label>
                                    <input 
                                        type="text" 
                                        value={t('contact_location_hint')}
                                        onChange={(e) => updateTranslation('HU', 'contact_location_hint', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Bank Neve</label>
                                    <input 
                                        type="text" 
                                        value={t('bank_name')}
                                        onChange={(e) => updateTranslation('HU', 'bank_name', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">Számlaszám</label>
                                    <input 
                                        type="text" 
                                        value={t('bank_account')}
                                        onChange={(e) => updateTranslation('HU', 'bank_account', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">SWIFT</label>
                                    <input 
                                        type="text" 
                                        value={t('bank_swift')}
                                        onChange={(e) => updateTranslation('HU', 'bank_swift', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black font-mono"
                                    />
                                </div>
                                <div className="md:col-span-4 space-y-3">
                                    <label className="text-xs uppercase tracking-[0.2em] font-black text-gold">IBAN</label>
                                    <input 
                                        type="text" 
                                        value={t('bank_iban')}
                                        onChange={(e) => updateTranslation('HU', 'bank_iban', e.target.value)}
                                        className="w-full bg-[#0d0902] border border-gold/10 p-4 text-sm text-ivory outline-none focus:border-gold/40 font-black font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gallery' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gold/10">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif text-ivory tracking-widest uppercase">Galéria Kezelés</h1>
                            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] font-black">
                                Egyedi ékszerek és referenciák kezelése kategóriák szerint
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                const title = prompt('Új kategória címe:');
                                if (title) {
                                    const desc = prompt('Rövid leírás (elhagyható):') || '';
                                    updateCustomJewelry([...customJewelry, { id: `cat_${Date.now()}`, title, description: desc, images: [] }]);
                                }
                            }}
                            className="bg-ivory text-deep-brown px-8 py-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gold transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Új Kategória
                        </button>
                    </div>

                    <div className="space-y-16">
                        {customJewelry.map((cat) => (
                            <div key={cat.id} className="bg-black/20 border border-gold/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                                <div className="p-8 bg-gold/5 border-b border-gold/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-serif text-ivory uppercase tracking-widest">{cat.title}</h3>
                                        <p className="text-xs text-ivory/40 uppercase tracking-widest italic">{cat.description}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <input 
                                            type="file" 
                                            id={`bulk-upload-${cat.id}`}
                                            className="hidden" 
                                            multiple 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;
                                                
                                                setIsUploadingBulk(cat.id);
                                                const newImages = [...cat.images];
                                                
                                                for (const file of files) {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    try {
                                                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            newImages.push({ url: data.url, description: '' });
                                                        }
                                                    } catch (err) {
                                                        console.error("Upload error:", err);
                                                    }
                                                }
                                                
                                                const updated = customJewelry.map(c => c.id === cat.id ? { ...c, images: newImages } : c);
                                                updateCustomJewelry(updated);
                                                setIsUploadingBulk(null);
                                            }}
                                        />
                                        <button 
                                            disabled={isUploadingBulk !== null}
                                            onClick={() => document.getElementById(`bulk-upload-${cat.id}`)?.click()}
                                            className="px-6 py-3 bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 rounded text-[11px] uppercase font-black tracking-widest flex items-center gap-3 transition-all"
                                        >
                                            {isUploadingBulk === cat.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4" />
                                            )}
                                            {isUploadingBulk === cat.id ? 'Feltöltés...' : 'Fotók hozzáadása'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (confirm('Biztosan törli ezt a kategóriát az összes fotóval együtt?')) {
                                                    updateCustomJewelry(customJewelry.filter(c => c.id !== cat.id));
                                                }
                                            }}
                                            className="p-3 bg-red-500/5 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 rounded border border-red-500/10 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        {cat.images.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-[3/4] bg-deep-brown border border-gold/10 rounded-lg overflow-hidden">
                                                <Image src={img.url} alt="" fill className="object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-4">
                                                    <button 
                                                        onClick={() => {
                                                            const updatedImages = cat.images.filter((_, i) => i !== idx);
                                                            updateCustomJewelry(customJewelry.map(c => c.id === cat.id ? { ...c, images: updatedImages } : c));
                                                        }}
                                                        className="self-end p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Leírás..."
                                                        value={img.description}
                                                        onChange={(e) => {
                                                            const updatedImages = [...cat.images];
                                                            updatedImages[idx] = { ...img, description: e.target.value };
                                                            updateCustomJewelry(customJewelry.map(c => c.id === cat.id ? { ...c, images: updatedImages } : c));
                                                        }}
                                                        className="w-full bg-black/40 border border-gold/20 p-2 text-[10px] text-ivory outline-none focus:border-gold/60 uppercase font-black"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {cat.images.length === 0 && (
                                            <div className="col-span-full py-12 text-center border-2 border-dashed border-gold/5 rounded-xl">
                                                <p className="text-ivory/20 text-[11px] uppercase tracking-widest font-black">Nincsenek fotók ebben a kategóriában.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminProductsContent />
        </Suspense>
    );
}
