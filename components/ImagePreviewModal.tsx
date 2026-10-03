"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    title: string;
}

const ImagePreviewModal = ({ isOpen, onClose, imageSrc, title }: ImagePreviewModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-[#150e03] border border-gold/20 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(201,165,106,0.15)] flex flex-col max-h-full"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-gold/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gold/10 rounded-xl text-gold">
                                    <ZoomIn className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-ivory font-serif text-lg md:text-xl uppercase tracking-widest">{title}</h3>
                                    <p className="text-gold/40 text-[9px] uppercase tracking-[0.3em] font-black mt-1">Nagyítás és részletek</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-ivory/60 hover:text-gold transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Image Body */}
                        <div className="flex-1 relative min-h-[300px] md:min-h-[500px] bg-black/40 overflow-auto">
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                {imageSrc ? (
                                    <div className="relative w-full h-full min-h-[400px]">
                                        <Image
                                            src={imageSrc}
                                            alt={title}
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="text-gold/20 flex flex-col items-center gap-4 py-32">
                                        <ZoomIn className="h-16 w-16 opacity-20" />
                                        <p className="font-serif italic text-lg uppercase tracking-widest">Kép hamarosan...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Caption */}
                        <div className="p-6 text-center border-t border-gold/5 bg-black/20">
                            <button
                                onClick={onClose}
                                className="bg-gold text-deep-brown px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold/80 transition-all shadow-lg"
                            >
                                Rendben
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImagePreviewModal;
