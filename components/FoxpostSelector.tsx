"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FoxpostSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (machine: { name: string, address: string, zip: string, city: string }) => void;
}

export default function FoxpostSelector({ isOpen, onClose, onSelect }: FoxpostSelectorProps) {
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://cdn.foxpost.hu') return;

            try {
                // Parse if string, otherwise use directly
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                // Foxpost might send data directly or inside an apt object
                const machineData = data.apt || data;

                if (machineData && machineData.name && machineData.address) {
                    onSelect(machineData);
                }
            } catch (e) {
                console.error("Failed to parse foxpost message", e);
            }
        };

        if (isOpen) {
            window.addEventListener('message', handleMessage);
        }

        return () => window.removeEventListener('message', handleMessage);
    }, [isOpen, onSelect]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#f11a22]"></span>
                        Foxpost Automata Kiválasztása
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700 transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 w-full bg-white">
                    <iframe 
                        src="https://cdn.foxpost.hu/apt-finder/v1/app/" 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        loading="lazy"
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
