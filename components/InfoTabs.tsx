"use client";

import React from 'react';
import Link from 'next/link';
import { useConfig } from './ConfigProvider';

const InfoTabs = ({ transparent = false }: { transparent?: boolean }) => {
    const { t } = useConfig();

    const tabs = [
        { name: t('about'), href: '/about' },
        { name: t('gallery'), href: '/gallery' },
        { name: t('contact'), href: '/contact' },
        { name: t('terms'), href: '/terms' },
        { name: t('mission'), href: '/mission' },
        { name: t('reference'), href: '/reference' },
    ];

    return (
        <div className={`w-full ${transparent ? 'bg-transparent' : 'bg-transparent'} py-2`}>
            <div className="max-w-[1400px] mx-auto px-6 overflow-x-auto custom-scrollbar scroll-smooth">
                <ul className="flex justify-start md:justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 py-2 min-w-max">
                    {tabs.map((tab) => (
                        <li key={tab.name} className="whitespace-nowrap">
                             <Link 
                                 href={tab.href}
                                 className="text-xs sm:text-sm md:text-base uppercase tracking-[0.1em] text-[#c9a56a]/80 hover:text-[#c9a56a] transition-colors font-bold"
                             >
                                 {tab.name}
                             </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InfoTabs;
