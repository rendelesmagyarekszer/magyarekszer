"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface AdminMultipleImageUploadProps {
    label: string;
    images: string[];
    onChange: (images: string[]) => void;
    helperText?: string;
}

export const AdminMultipleImageUpload: React.FC<AdminMultipleImageUploadProps> = ({ 
    label, 
    images = [], 
    onChange, 
    helperText
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages = [...images];

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                newImages.push(data.url);
            }
            onChange(newImages);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Hiba történt a képek feltöltése során.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className="space-y-3 group mt-6 border-t border-gold/10 pt-6">
            <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold/80">{label}</label>
                {helperText && <span className="text-[8px] text-ivory/30 uppercase tracking-widest">{helperText}</span>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-full aspect-square bg-black/40 border border-gold/10 rounded-xl overflow-hidden flex items-center justify-center group/item transition-all shadow-inner">
                        <img 
                            src={imgUrl} 
                            alt={`Preview ${idx + 1}`} 
                            className="w-full h-full object-cover animate-fade-in"
                        />
                        <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-ivory/60 hover:text-red-400 backdrop-blur-md opacity-0 group-hover/item:opacity-100 transition-all border border-white/5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {/* Upload Button Box */}
                <button 
                    type="button" 
                    onClick={triggerUpload}
                    disabled={isUploading}
                    className="w-full aspect-square bg-gold/5 border border-dashed border-gold/20 hover:border-gold/40 hover:bg-gold/10 rounded-xl transition-all flex flex-col items-center justify-center gap-3 group/btn cursor-pointer"
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 text-gold animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-gold/60 group-hover/btn:text-gold group-hover/btn:scale-110 transition-all" />
                            <span className="text-[9px] uppercase font-black tracking-widest text-gold/60 group-hover/btn:text-gold text-center px-2">Képek hozzáadása</span>
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
                multiple
            />
        </div>
    );
};
