"use client";

import React, { useState } from 'react';
import { Search, MapPin, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MplPoint {
    id: string;
    name: string;
    city: string;
    address: string;
    postcode: string;
    type: 'automata' | 'postapont';
}

// Expanded list of common terminals for major cities
const COMMON_POINTS: MplPoint[] = [
    // Budapest
    { id: 'MPL001', name: 'Allee Csomagautomata', city: 'Budapest', address: 'Október huszonharmadika u. 8-10.', postcode: '1117', type: 'automata' },
    { id: 'MPL002', name: 'Westend Csomagautomata', city: 'Budapest', address: 'Váci út 1-3.', postcode: '1062', type: 'automata' },
    { id: 'MPL003', name: 'Árkád Csomagautomata', city: 'Budapest', address: 'Örs vezér tere 25/A', postcode: '1106', type: 'automata' },
    { id: 'MPL004', name: 'Mammut Csomagautomata', city: 'Budapest', address: 'Lövőház u. 2-6.', postcode: '1024', type: 'automata' },
    { id: 'MPL005', name: 'Corvin Plaza Csomagautomata', city: 'Budapest', address: 'Futó u. 37-45.', postcode: '1083', type: 'automata' },
    { id: 'MPL006', name: 'Arena Mall Csomagautomata', city: 'Budapest', address: 'Kerepesi út 9.', postcode: '1087', type: 'automata' },
    { id: 'MPL007', name: 'MOM Park Csomagautomata', city: 'Budapest', address: 'Alkotás u. 53.', postcode: '1123', type: 'automata' },
    { id: 'MPL008', name: 'Pólus Center Csomagautomata', city: 'Budapest', address: 'Szentmihályi út 131.', postcode: '1152', type: 'automata' },
    
    // Debrecen
    { id: 'MPL101', name: 'Debrecen Malom Park', city: 'Debrecen', address: 'Füredi út 27.', postcode: '4027', type: 'automata' },
    { id: 'MPL102', name: 'Debrecen Plaza', city: 'Debrecen', address: 'Péterfia u. 18.', postcode: '4026', type: 'automata' },
    { id: 'MPL103', name: 'Debrecen Fórum', city: 'Debrecen', address: 'Csapó u. 30.', postcode: '4024', type: 'automata' },
    
    // Miskolc
    { id: 'MPL201', name: 'Miskolc Plaza', city: 'Miskolc', address: 'Király u. 1/A', postcode: '3525', type: 'automata' },
    { id: 'MPL202', name: 'Miskolc Szinvapark', city: 'Miskolc', address: 'Bajcsy-Zsilinszky út 2-4.', postcode: '3527', type: 'automata' },
    
    // Szeged
    { id: 'MPL301', name: 'Szeged Árkád', city: 'Szeged', address: 'Londoni krt. 3.', postcode: '6724', type: 'automata' },
    { id: 'MPL302', name: 'Szeged Plaza', city: 'Szeged', address: 'Kossuth Lajos sugárút 119.', postcode: '6724', type: 'automata' },
    
    // Pécs
    { id: 'MPL401', name: 'Pécs Árkád', city: 'Pécs', address: 'Bajcsy-Zsilinszky u. 11.', postcode: '7622', type: 'automata' },
    { id: 'MPL402', name: 'Pécs Plaza', city: 'Pécs', address: 'Megyeri út 76.', postcode: '7632', type: 'automata' },
    
    // Győr
    { id: 'MPL501', name: 'Győr Árkád', city: 'Győr', address: 'Budai út 1.', postcode: '9027', type: 'automata' },
    { id: 'MPL502', name: 'Győr Plaza', city: 'Győr', address: 'Vasvári Pál u. 1/A', postcode: '9023', type: 'automata' },
    
    // Nyíregyháza
    { id: 'MPL601', name: 'Nyíregyháza Korzó', city: 'Nyíregyháza', address: 'Nagy Imre tér 1.', postcode: '4400', type: 'automata' },
    
    // Kecskemét
    { id: 'MPL701', name: 'Kecskemét Malom Center', city: 'Kecskemét', address: 'Korona u. 2.', postcode: '6000', type: 'automata' },
    
    // Székesfehérvár
    { id: 'MPL801', name: 'Székesfehérvár Alba Plaza', city: 'Székesfehérvár', address: 'Palotai út 1.', postcode: '8000', type: 'automata' },
    
    // Szombathely
    { id: 'MPL901', name: 'Szombathely Savaria Plaza', city: 'Szombathely', address: 'Körmendi út 52-54.', postcode: '9700', type: 'automata' },
    
    // Veszprém
    { id: 'MPL911', name: 'Veszprém Balaton Plaza', city: 'Veszprém', address: 'Budapesti út 20-28.', postcode: '8200', type: 'automata' },
    
    // Sopron
    { id: 'MPL921', name: 'Sopron Plaza', city: 'Sopron', address: 'Lackner Kristóf u. 35.', postcode: '9400', type: 'automata' },
    
    // PostaPont példák
    { id: 'PP001', name: 'Postahivatal - Budapest 112', city: 'Budapest', address: 'Fehérvári út 89-95.', postcode: '1119', type: 'postapont' },
    { id: 'PP002', name: 'Postahivatal - Debrecen 1', city: 'Debrecen', address: 'Hatvan u. 5-7.', postcode: '4025', type: 'postapont' },
    { id: 'PP003', name: 'MOL Töltőállomás - Szeged', city: 'Szeged', address: 'Bajai út', postcode: '6725', type: 'postapont' },
];

interface MplPointSelectorProps {
    onSelect: (point: MplPoint) => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function MplPointSelector({ onSelect, onClose, isOpen }: MplPointSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPoint, setSelectedPoint] = useState<MplPoint | null>(null);

    const filteredPoints = COMMON_POINTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.postcode.includes(searchQuery)
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        className="relative w-full max-w-2xl bg-[#1a1205] border border-[#c9a56a]/30 p-8 md:p-12 shadow-[0_0_100px_rgba(201,165,106,0.1)] rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-serif text-[#fdfdf3] uppercase tracking-[0.2em]">Csomagautomata választó</h2>
                            <button onClick={onClose} className="p-2 text-[#666666] hover:text-[#c9a56a] transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#444444]" />
                            <input 
                                type="text"
                                placeholder="Város, utca vagy automata neve..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#150e03] border border-[#c9a56a]/20 p-5 pl-14 outline-none focus:border-[#c9a56a] text-base font-serif text-[#fdfdf3] placeholder:text-[#444444] rounded-2xl"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {filteredPoints.length > 0 ? (
                                filteredPoints.map(point => (
                                    <button
                                        key={point.id}
                                        onClick={() => setSelectedPoint(point)}
                                        className={`w-full flex items-start text-left p-6 border transition-all rounded-2xl ${
                                            selectedPoint?.id === point.id 
                                            ? 'border-[#c9a56a] bg-[#c9a56a]/10' 
                                            : 'border-[#c9a56a]/10 hover:border-[#c9a56a]/40 bg-white/5'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-full mr-4 ${selectedPoint?.id === point.id ? 'bg-[#c9a56a] text-[#150e03]' : 'bg-[#150e03] text-[#333333]'}`}>
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-[11px] text-[#fdfdf3] uppercase tracking-widest">{point.name}</p>
                                            <p className="text-[10px] text-[#666666] uppercase tracking-wider mt-1">{point.city}, {point.address}</p>
                                        </div>
                                        {selectedPoint?.id === point.id && (
                                            <CheckCircle2 className="h-5 w-5 text-[#c9a56a] ml-4 shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-[#c9a56a]/20 space-y-6">
                                    <p className="text-[#666666] italic font-serif px-6">Nem találja a kívánt pontot a listában?</p>
                                    <button 
                                        onClick={() => {
                                            const manual = prompt('Kérjük írja be az automata vagy PostaPont pontos nevét és címét:');
                                            if (manual) {
                                                onSelect({
                                                    id: 'MANUAL',
                                                    name: 'Egyedi választás: ' + manual,
                                                    city: '-',
                                                    address: manual,
                                                    postcode: '-',
                                                    type: 'automata'
                                                });
                                            }
                                        }}
                                        className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c9a56a] border border-[#c9a56a]/30 px-6 py-3 hover:bg-[#c9a56a]/10 transition-all"
                                    >
                                        Saját cím megadása manuálisan
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#c9a56a]/10 flex flex-col gap-4">
                            <p className="text-[9px] text-[#666666] uppercase tracking-[0.2em] italic text-center">
                                * Ez egy válogatott lista a legnépszerűbb automatákról. <br/> 
                                Ha nem találja a kívánt pontot, kérjük írja a megjegyzésbe!
                            </p>
                            <button
                                disabled={!selectedPoint}
                                onClick={() => selectedPoint && onSelect(selectedPoint)}
                                className={`w-full py-6 rounded-2xl font-black tracking-[0.4em] uppercase text-[11px] transition-all ${
                                    selectedPoint 
                                    ? 'bg-[#c9a56a] text-[#150e03] shadow-lg shadow-[#c9a56a]/20 hover:scale-[1.02]' 
                                    : 'bg-[#333333] text-[#666666] cursor-not-allowed opacity-50'
                                }`}
                            >
                                Kiválasztás megerősítése
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
