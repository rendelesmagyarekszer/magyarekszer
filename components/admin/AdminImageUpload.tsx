"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';

interface AdminImageUploadProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helperText?: string;
    placeholder?: string;
}

export const AdminImageUpload: React.FC<AdminImageUploadProps> = ({ 
    label, 
    value, 
    onChange, 
    helperText,
    placeholder = "/products/image-name.jpg"
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Hiba történt a feltöltés során.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const clearImage = () => {
        onChange('');
    };

    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold/80">{label}</label>
                {helperText && <span className="text-[8px] text-ivory/30 uppercase tracking-widest">{helperText}</span>}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Preview Frame */}
                <div className="relative w-full md:w-32 h-32 bg-black/40 border border-gold/10 rounded-xl overflow-hidden flex items-center justify-center group-hover:border-gold/30 transition-all shadow-inner">
                    {value ? (
                        <>
                            <img 
                                src={value} 
                                alt="Preview" 
                                className="w-full h-full object-cover animate-fade-in"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a1a/c9a56a?text=Hiba';
                                }}
                            />
                            <button 
                                type="button"
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-ivory/60 hover:text-red-400 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="h-6 w-6 text-gold/20" />
                    )}
                    
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-gold animate-spin" />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-1 flex flex-col gap-3 justify-center">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30">
                            <LinkIcon className="h-4 w-4" />
                        </div>
                        <input 
                            type="text" 
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-ivory/5 border border-gold/10 p-4 pl-12 text-xs text-ivory outline-none focus:border-gold/40 rounded-xl placeholder:text-ivory/20 transition-all"
                            placeholder={placeholder}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={triggerUpload}
                            disabled={isUploading}
                            className="flex-1 bg-gold/5 border border-gold/20 hover:bg-gold/10 py-3 rounded-xl transition-all flex items-center justify-center gap-3 group/btn cursor-pointer"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 text-gold animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 text-gold group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gold/80 group-hover/btn:text-gold">Tallózás a gépről</span>
                                </>
                            )}
                        </button>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
            </div>
        </div>
    );
};
