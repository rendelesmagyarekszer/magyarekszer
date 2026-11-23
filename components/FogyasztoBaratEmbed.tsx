"use client";

import React, { useEffect, useRef } from 'react';

interface FogyasztoBaratEmbedProps {
    type: 'aszf' | 'at' | 'def';
}

export default function FogyasztoBaratEmbed({ type }: FogyasztoBaratEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clean any previously mounted embed in this container or stray fbarat-embed script
        container.innerHTML = '';
        const existingGlobal = document.getElementById('fbarat-embed');
        if (existingGlobal && existingGlobal.parentNode) {
            existingGlobal.parentNode.removeChild(existingGlobal);
        }

        const anchor = document.createElement('div');
        anchor.id = 'barat_script';
        container.appendChild(anchor);

        const script = document.createElement('script');
        script.src = 'https://admin.fogyasztobarat.hu/e-api.js';
        script.type = 'text/javascript';
        script.setAttribute('data-id', 'ENB7UDI0');
        script.setAttribute('id', 'fbarat-embed');
        script.setAttribute('data-type', type);
        script.async = true;

        container.insertBefore(script, anchor);

        return () => {
            container.innerHTML = '';
        };
    }, [type]);

    return (
        <div className="bg-[#1e1408] text-[#fdfdf3] rounded-2xl p-6 sm:p-10 shadow-2xl border border-gold/25 min-h-[320px] overflow-x-auto">
            <div ref={containerRef} className="fbarat-container w-full" />
        </div>
    );
}
