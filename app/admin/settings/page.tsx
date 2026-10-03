"use client";

import React, { useState } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Link as LinkIcon, Gem, Cpu, Wrench, Star, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { AdminImageUpload } from '@/components/admin/AdminImageUpload';
import { categories as defaultCategories } from '@/lib/data';

export default function SettingsPage() {
    const { 
        ankerPrices, barbaraPrices, updateChainPrice, 
        globalEnamelColors, updateGlobalEnamelColors,
        extraServices, updateExtraServices, deleteExtraService,
        premiumBoxPrice, updatePremiumBoxPrice,
        imageSettings, updateImageSetting,
        customJewelry, updateCustomJewelry,
        isLoaded
    } = useConfig();
    
    const [localAnker, setLocalAnker] = useState(ankerPrices);
    const [localBarbara, setLocalBarbara] = useState(barbaraPrices);
    const [localEnamelColors, setLocalEnamelColors] = useState(globalEnamelColors);
    const [newColor, setNewColor] = useState('');
    
    const [localServices, setLocalServices] = useState(extraServices);
    const [localBoxPrice, setLocalBoxPrice] = useState(premiumBoxPrice);
    const [localImageSettings, setLocalImageSettings] = useState(imageSettings);
    const [localCustomJewelry, setLocalCustomJewelry] = useState(customJewelry);

    const [isSaving, setIsSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Sync local state when config is loaded from storage
    React.useEffect(() => {
        if (isLoaded) {
            setLocalAnker(ankerPrices);
            setLocalBarbara(barbaraPrices);
            setLocalEnamelColors(globalEnamelColors);
            setLocalServices(extraServices);
            setLocalBoxPrice(premiumBoxPrice);
            setLocalImageSettings(imageSettings);
            setLocalCustomJewelry(customJewelry);
        }
    }, [isLoaded, ankerPrices, barbaraPrices, globalEnamelColors, extraServices, premiumBoxPrice, imageSettings, customJewelry]);

    const handleSave = () => {
        setIsSaving(true);
        
        // Save Anker
        Object.entries(localAnker).forEach(([len, price]) => {
            updateChainPrice('anker', len, price);
        });

        // Save Barbara
        Object.entries(localBarbara).forEach(([len, price]) => {
            updateChainPrice('barbara', len, price);
        });

        // Save Enamel Colors
        updateGlobalEnamelColors(localEnamelColors);

        // Save Services (Bulk)
        updateExtraServices(localServices);

        // Save Premium Box Price
        updatePremiumBoxPrice(localBoxPrice);

        // Save Image Settings
        Object.entries(localImageSettings).forEach(([key, value]) => {
            updateImageSetting(key, value);
        });

        // Save Custom Jewelry
        updateCustomJewelry(localCustomJewelry);

        setTimeout(() => {
            setIsSaving(false);
            setMessage('Beállítások sikeresen mentve!');
            setTimeout(() => setMessage(null), 3000);
        }, 800);
    };

    const addColor = () => {
        if (newColor.trim() && !localEnamelColors.includes(newColor.trim())) {
            setLocalEnamelColors([...localEnamelColors, newColor.trim()]);
            setNewColor('');
        }
    };

    const removeColor = (color: string) => {
        setLocalEnamelColors(localEnamelColors.filter(c => c !== color));
    };

    const updateService = (id: string, field: string, value: string) => {
        setLocalServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const addMaterial = () => {
        const newId = `cast_${Date.now()}`;
        setLocalServices(prev => [...prev, {
            id: newId,
            category: 'casting',
            name: 'Új anyag',
            desc: 'Leírás az új anyagról...',
            price: 'Kalkuláció alatt',
            price2: 'Napi ár alapján',
            icon: 'Gem'
        }]);
    };

    const removeService = (id: string) => {
        setLocalServices(prev => prev.filter(s => s.id !== id));
        deleteExtraService(id);
    };

    const updateCustomCategory = (id: string, field: string, value: any) => {
        setLocalCustomJewelry(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addCustomImage = (id: string) => {
        setLocalCustomJewelry(prev => prev.map(c => c.id === id ? { ...c, images: [...c.images, { url: '', description: '' }] } : c));
    };

    const updateCustomImage = (catId: string, imgIdx: number, field: 'url' | 'description', value: string) => {
        setLocalCustomJewelry(prev => prev.map(c => {
            if (c.id === catId) {
                const newImages = [...c.images];
                newImages[imgIdx] = { ...newImages[imgIdx], [field]: value };
                return { ...c, images: newImages };
            }
            return c;
        }));
    };

    const removeCustomImage = (catId: string, imgIdx: number) => {
        setLocalCustomJewelry(prev => prev.map(c => {
            if (c.id === catId) {
                return { ...c, images: c.images.filter((_, i) => i !== imgIdx) };
            }
            return c;
        }));
    };

    const addCustomCategory = () => {
        const newId = `custom_${Date.now()}`;
        setLocalCustomJewelry(prev => [...prev, {
            id: newId,
            title: 'Új Egyedi Kategória',
            description: 'Leírás az egyedi ékszertípusról...',
            images: [],
            isFeatured: false
        }]);
    };

    const removeCustomCategory = (id: string) => {
        setLocalCustomJewelry(prev => prev.filter(c => c.id !== id));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, fieldId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldId);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                callback(data.url);
            } else {
                alert('Töltési hiba: ' + (data.error || 'Ismeretlen hiba'));
            }
        } catch (err) {
            console.error(err);
            alert('Hiba történt a fájl küldésekor.');
        } finally {
            setUploadingField(null);
        }
    };

    const categories = [
        { id: 'casting', name: 'Nemesfém Öntés (Anyagok)', isCasting: true, icon: Gem, priceLabel: 'Öntés díja', price2Label: 'Anyag ára' },
        { id: 'digital', name: 'Digitális Szolgáltatások', isCasting: false, icon: Cpu, priceLabel: 'Díj 1', price2Label: 'Díj 2 (opc)' },
        { id: 'workshop', name: 'Műhely & Javítás', isCasting: false, icon: Wrench, priceLabel: 'Díj 1', price2Label: 'Díj 2 (opc)' },
        { id: 'specialty', name: 'Speciális Feladatok', isCasting: false, icon: Star, priceLabel: 'Díj 1', price2Label: 'Díj 2 (opc)' },
    ];

    return (
        <div className="space-y-16 pb-20">
            <div className="flex justify-between items-end border-b border-gold/10 pb-8">
                <div>
                    <h1 className="text-3xl font-serif text-[#fdfdf3] uppercase tracking-[0.4em]">Beállítások</h1>
                    <p className="text-sm uppercase tracking-widest text-[#666666] mt-2 font-bold italic">Globális árazás és szolgáltatások kezelése</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-[#c9a56a] text-[#150e03] px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#b08d55] transition-all disabled:opacity-50 shadow-xl shadow-gold/10"
                >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Változások Mentése
                </button>
            </div>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-xl text-center text-xs uppercase tracking-widest font-black"
                >
                    {message}
                </motion.div>
            )}

            {/* Extra Services Section */}
            <div className="space-y-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold/10 rounded-lg text-gold">
                        <Star className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif uppercase tracking-widest text-ivory">Egyéb Szolgáltatások Kezelése</h2>
                        <p className="text-[11px] uppercase tracking-widest text-gold/40 font-bold mt-1">Kettős árazás (öntési díj + anyagár) és leírások szerkesztése</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-black/40 border border-gold/10 rounded-2xl p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-gold/5 pb-4">
                                <div className="flex items-center gap-4">
                                    <cat.icon className="h-5 w-5 text-gold/60" />
                                    <h3 className="text-base font-black uppercase tracking-widest text-gold">{cat.name}</h3>
                                </div>
                                {cat.isCasting && (
                                    <button 
                                        onClick={addMaterial}
                                        className="text-[11px] uppercase tracking-widest font-black px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-all shrink-0"
                                    >
                                        + Új Anyag hozzáadása
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {localServices.filter(s => s.category === cat.id).map(service => (
                                    <div key={service.id} className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 bg-white/[0.02] rounded-xl border border-white/5 items-center hover:bg-white/[0.04] transition-all">
                                        <div className="xl:col-span-2">
                                            <label className="text-xs uppercase tracking-widest text-gold/60 mb-1.5 block font-black">Név / Anyag</label>
                                            <input 
                                                type="text" 
                                                value={service.name}
                                                onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                                className="w-full bg-black/60 border border-gold/20 p-4 rounded-lg text-base text-ivory focus:border-gold outline-none transition-all font-serif"
                                            />
                                        </div>
                                        <div className="xl:col-span-4">
                                            <label className="text-xs uppercase tracking-widest text-gold/60 mb-1.5 block font-black">Rövid leírás</label>
                                            <input 
                                                type="text" 
                                                value={service.desc}
                                                onChange={(e) => updateService(service.id, 'desc', e.target.value)}
                                                className="w-full bg-black/60 border border-gold/20 p-4 rounded-lg text-base text-ivory/60 focus:border-gold outline-none transition-all"
                                            />
                                        </div>
                                        <div className="xl:col-span-2">
                                            <label className="text-sm uppercase tracking-widest text-gold/60 mb-1.5 block font-black">{cat.priceLabel}</label>
                                            <input 
                                                type="text" 
                                                value={service.price}
                                                onChange={(e) => updateService(service.id, 'price', e.target.value)}
                                                className="w-full bg-black/60 border border-gold/20 p-4 rounded-lg text-base text-gold font-bold uppercase tracking-widest focus:border-gold outline-none transition-all ring-1 ring-gold/10"
                                            />
                                        </div>
                                        <div className="xl:col-span-2">
                                            <label className="text-sm uppercase tracking-widest text-gold/60 mb-1.5 block font-black">{cat.price2Label}</label>
                                            <input 
                                                type="text" 
                                                value={service.price2 || ''}
                                                onChange={(e) => updateService(service.id, 'price2', e.target.value)}
                                                className="w-full bg-black/60 border border-gold/20 p-4 rounded-lg text-base text-gold/80 font-bold uppercase tracking-widest focus:border-gold outline-none transition-all"
                                                placeholder="–"
                                            />
                                        </div>
                                        <div className="xl:col-span-2 flex justify-end gap-4">
                                            <button 
                                                onClick={() => removeService(service.id)}
                                                className="p-2 text-red-500/30 hover:text-red-500 transition-colors"
                                                title="Törlés"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {localServices.filter(s => s.category === cat.id).length === 0 && (
                                    <p className="text-center py-10 text-xs text-ivory/20 uppercase tracking-widest italic">Nincsenek tételek ebben a kategóriában.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Anker Pricing */}
                <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <LinkIcon className="h-5 w-5 text-[#c9a56a]" />
                        <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Anker Lánc Árak</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {Object.keys(localAnker).sort().map((len) => (
                            <div key={`anker-${len}`} className="flex items-center justify-between gap-6 p-4 bg-[#0d0902] rounded-xl border border-[#c9a56a]/5">
                                <span className="text-base font-black text-[#c9a56a] uppercase tracking-widest">{len} cm</span>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={localAnker[len]}
                                        onChange={(e) => setLocalAnker({ ...localAnker, [len]: parseInt(e.target.value) || 0 })}
                                        className="bg-[#150e03] border border-[#c9a56a]/20 p-4 rounded-lg text-right text-base text-[#fdfdf3] outline-none focus:border-[#c9a56a] w-40 font-serif"
                                    />
                                    <span className="text-sm text-[#666666] font-bold uppercase tracking-widest">Ft</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Barbara Pricing */}
                <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <LinkIcon className="h-5 w-5 text-[#c9a56a]" />
                        <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Barbara Lánc Árak</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {Object.keys(localBarbara).sort().map((len) => (
                            <div key={`barbara-${len}`} className="flex items-center justify-between gap-6 p-4 bg-[#0d0902] rounded-xl border border-[#c9a56a]/5">
                                <span className="text-base font-black text-[#c9a56a] uppercase tracking-widest">{len} cm</span>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={localBarbara[len]}
                                        onChange={(e) => setLocalBarbara({ ...localBarbara, [len]: parseInt(e.target.value) || 0 })}
                                        className="bg-[#150e03] border border-[#c9a56a]/20 p-4 rounded-lg text-right text-base text-[#fdfdf3] outline-none focus:border-[#c9a56a] w-40 font-serif"
                                    />
                                    <span className="text-sm text-[#666666] font-bold uppercase tracking-widest">Ft</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enamel Colors Section */}
            <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <Save className="h-5 w-5 text-[#c9a56a]" />
                    <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Globális Zománc Színek</h2>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addColor()}
                            placeholder="Új zománc szín hozzáadása (pl. Türkiz)..."
                            className="flex-1 bg-[#0d0902] border border-[#c9a56a]/20 p-4 rounded-xl text-sm text-[#fdfdf3] outline-none focus:border-[#c9a56a]"
                        />
                        <button 
                            onClick={addColor}
                            className="bg-[#c9a56a]/10 hover:bg-[#c9a56a]/20 border border-[#c9a56a]/30 text-[#c9a56a] px-8 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Hozzáadás
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 p-6 bg-[#0d0902] rounded-2xl border border-[#c9a56a]/5">
                        {localEnamelColors.map((color) => (
                            <div key={color} className="flex items-center gap-2 bg-[#c9a56a] text-[#150e03] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg">
                                {color}
                                <button 
                                    onClick={() => removeColor(color)}
                                    className="hover:text-red-900 transition-colors ml-2 border-l border-[#150e03]/20 pl-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {localEnamelColors.length === 0 && (
                            <p className="text-xs text-[#666666] italic uppercase tracking-widest">Nincsenek megadva színek. Adjon hozzá egyet feljebb!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Previews Section */}
            <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#c9a56a]" />
                    <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Termék Előnézeti Képek</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xs uppercase tracking-widest text-[#c9a56a]/60 font-black px-4 border-l-2 border-[#c9a56a]/40">Lánc típusok</h3>
                        <div className="space-y-4">
                            <AdminImageUpload 
                                label="Anker lánc kép"
                                value={localImageSettings.anker_chain}
                                onChange={(val) => setLocalImageSettings({ ...localImageSettings, anker_chain: val })}
                                helperText="URL vagy közvetlen feltöltés"
                            />
                            <AdminImageUpload 
                                label="Barbara lánc kép"
                                value={localImageSettings.barbara_chain}
                                onChange={(val) => setLocalImageSettings({ ...localImageSettings, barbara_chain: val })}
                                helperText="URL vagy közvetlen feltöltés"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs uppercase tracking-widest text-[#c9a56a]/60 font-black px-4 border-l-2 border-[#c9a56a]/40">Díszdobozok</h3>
                        <div className="space-y-4">
                            <AdminImageUpload 
                                label="Alap doboz kép"
                                value={localImageSettings.standard_box}
                                onChange={(val) => setLocalImageSettings({ ...localImageSettings, standard_box: val })}
                                helperText="URL vagy közvetlen feltöltés"
                            />
                            <AdminImageUpload 
                                label="Prémium doboz kép"
                                value={localImageSettings.premium_box}
                                onChange={(val) => setLocalImageSettings({ ...localImageSettings, premium_box: val })}
                                helperText="URL vagy közvetlen feltöltés"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Images Section */}
            <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-[#c9a56a]" />
                    <div>
                        <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Kategória Képek (Főoldal)</h2>
                        <p className="text-[10px] text-gold/40 uppercase tracking-widest mt-1 font-black">Képcsere után nyomja meg a "Változások Mentése" gombot a lap tetején!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {defaultCategories.map(cat => (
                        <div key={cat.slug} className="bg-black/40 border border-gold/10 p-6 rounded-xl space-y-4">
                            <h3 className="text-xs uppercase tracking-widest text-gold font-black">{cat.name}</h3>
                            <AdminImageUpload 
                                label=""
                                value={localImageSettings[`cat_${cat.slug}`] || ''}
                                onChange={(val) => {
                                    const updated = { ...localImageSettings, [`cat_${cat.slug}`]: val };
                                    setLocalImageSettings(updated);
                                    // Also save immediately so it persists
                                    updateImageSetting(`cat_${cat.slug}`, val);
                                }}
                                helperText="Feltöltés után azonnal mentve"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Accessories Section */}
            <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <Gem className="h-5 w-5 text-[#c9a56a]" />
                    <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Kiegészítők Árazása</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between gap-6 p-6 bg-[#0d0902] rounded-xl border border-[#c9a56a]/5">
                        <div>
                            <span className="text-sm font-black text-[#c9a56a] uppercase tracking-widest block">Prémium Díszdoboz</span>
                            <span className="text-xs text-[#666666] font-bold uppercase tracking-widest">Opcionális csomagolás ára</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                value={localBoxPrice}
                                onChange={(e) => setLocalBoxPrice(parseInt(e.target.value) || 0)}
                                className="bg-[#150e03] border border-[#c9a56a]/20 p-4 rounded-lg text-right text-base text-[#fdfdf3] outline-none focus:border-[#c9a56a] w-40 font-serif"
                            />
                            <span className="text-sm text-[#666666] font-bold uppercase tracking-widest">Ft</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Jewelry Management Section */}
            <div className="bg-[#150e03] border border-[#c9a56a]/10 p-8 rounded-2xl space-y-12">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Gem className="h-5 w-5 text-[#c9a56a]" />
                        <h2 className="text-base font-serif uppercase tracking-[0.2em] text-[#fdfdf3]">Amire büszkék vagyunk (Referencia) Kezelése</h2>
                    </div>
                    <button 
                        onClick={addCustomCategory}
                        className="text-[11px] uppercase tracking-widest font-black px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-all"
                    >
                        + Új Kategória hozzáadása
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {localCustomJewelry.map((cat) => (
                        <div key={cat.id} className="bg-black/20 border border-gold/5 rounded-2xl p-8 space-y-8 hover:border-gold/20 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-gold/60 mb-2 block font-black">Kategória Címe</label>
                                        <input 
                                            type="text" 
                                            value={cat.title}
                                            onChange={(e) => updateCustomCategory(cat.id, 'title', e.target.value)}
                                            className="w-full bg-[#0d0902] border border-[#c9a56a]/20 p-4 rounded-xl text-base text-[#fdfdf3] outline-none focus:border-[#c9a56a] font-serif"
                                        />
                                    </div>
                                    <div className="flex items-end gap-6">
                                        <div className="flex-1">
                                            <label className="text-xs uppercase tracking-widest text-gold/60 mb-2 block font-black">Státusz</label>
                                            <div className="flex items-center gap-4 h-[58px]">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={cat.isFeatured}
                                                        onChange={(e) => updateCustomCategory(cat.id, 'isFeatured', e.target.checked)}
                                                        className="w-4 h-4 accent-gold"
                                                    />
                                                    <span className="text-xs uppercase tracking-widest text-[#fdfdf3]/60 group-hover:text-gold transition-colors font-bold">Kiemelt megjelenés</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeCustomCategory(cat.id)}
                                    className="p-3 text-red-500/30 hover:text-red-500 transition-colors ml-4"
                                    title="Kategória törlése"
                                >
                                    ✕
                                </button>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-widest text-gold/60 mb-2 block font-black">Leírás</label>
                                <textarea 
                                    value={cat.description}
                                    onChange={(e) => updateCustomCategory(cat.id, 'description', e.target.value)}
                                    rows={2}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = (target.scrollHeight) + 'px';
                                    }}
                                    className="w-full bg-[#0d0902] border border-[#c9a56a]/20 p-4 rounded-xl text-base text-[#fdfdf3]/80 outline-none focus:border-[#c9a56a] resize-y overflow-hidden"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs uppercase tracking-widest text-gold/60 font-black">Képek (URL)</label>
                                    <button 
                                        onClick={() => addCustomImage(cat.id)}
                                        className="text-[10px] uppercase tracking-widest font-black text-gold hover:underline"
                                    >
                                        + Kép hozzáadása
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {cat.images.map((img, idx) => (
                                        <div key={idx} className="bg-black/40 border border-gold/10 rounded-xl p-4 space-y-3 relative group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] uppercase tracking-widest text-gold/40 font-black">Kép #{idx + 1}</span>
                                                <button 
                                                    onClick={() => removeCustomImage(cat.id, idx)}
                                                    className="p-1 text-red-500/20 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <AdminImageUpload 
                                                label=""
                                                value={img.url}
                                                onChange={(val) => updateCustomImage(cat.id, idx, 'url', val)}
                                                helperText="Feltöltés vagy URL"
                                            />
                                            <textarea 
                                                value={img.description}
                                                onChange={(e) => updateCustomImage(cat.id, idx, 'description', e.target.value)}
                                                placeholder="Pici szöveg a képhez (leírás)..."
                                                rows={2}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = 'auto';
                                                    target.style.height = (target.scrollHeight) + 'px';
                                                }}
                                                className="w-full bg-black/60 border border-gold/20 p-3 rounded-lg text-[13px] text-ivory/80 outline-none focus:border-gold transition-all resize-y overflow-hidden font-serif"
                                            />
                                        </div>
                                    ))}
                                    {cat.images.length === 0 && (
                                        <p className="text-xs text-[#666666] italic uppercase tracking-widest py-2">Nincs kép hozzáadva.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-gold/5 border border-gold/10 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-gold/20 rounded-lg text-gold shrink-0">
                    <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#fdfdf3] mb-1">Információ az árazásról és szolgáltatásokról</h3>
                    <p className="text-xs text-[#666666] leading-relaxed font-bold">
                        A fenti paneleken minden módosítás után ne felejtsen a „Változások Mentése” gombra kattintani. A szolgáltatásoknál megadott nevek, leírások és árak azonnal frissülnek az „Egyéb szolgáltatásaink” oldalon. Az öntési anyagoknál külön rögzítheti az öntési díjat és az anyagárat. A prémium díszdoboz ára a pénztár oldalon jelenik meg opcióként.
                    </p>
                </div>
            </div>
        </div>
    );
}
