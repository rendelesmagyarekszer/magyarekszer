"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

/**
 * Small upload widget used in the ultra‑compact admin settings page.
 * It POSTs the selected file to `/api/upload`, receives the public URL
 * and calls `onChange` so the ConfigProvider can persist the new image.
 */
export const CategoryImageUpload: React.FC<Props> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const resp = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const data = await resp.json();
      onChange(data.url);
    } catch (err) {
      console.error(err);
      alert("Hiba történt a feltöltés során.");
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* preview */}
      <div className="relative w-12 h-12 bg-black/40 rounded overflow-hidden flex items-center justify-center border border-gold/10">
        {value ? (
          <>
            <img
              src={value}
              alt="Kép"
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/48x48/1a1a1a/c9a56a?text=NoImg";
              }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0 right-0 p-0.5 bg-black/60 rounded-full text-ivory/60 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <Upload className="h-5 w-5 text-gold/20" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-gold animate-spin" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1 px-2 py-1 bg-gold/5 border border-gold/20 hover:bg-gold/10 rounded text-xs text-gold"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        📁 Kép cseréje
      </button>
    </div>
  );
};
